#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
PRE_IMAGE="${PRE_IMAGE:?set PRE_IMAGE}"
PRE_DOMAIN="${PRE_DOMAIN:-pre.weightlossmdcherrycreek.com}"
PRE_STORAGE_DOMAIN="${PRE_STORAGE_DOMAIN:-pre-storage.weightlossmdcherrycreek.com}"
PRE_STORAGE_CONSOLE_DOMAIN="${PRE_STORAGE_CONSOLE_DOMAIN:-pre-storage-console.weightlossmdcherrycreek.com}"
RELEASE_DIR="${RELEASE_DIR:-./releases}"

mkdir -p "$RELEASE_DIR"

echo "Deploying prerelease image: $PRE_IMAGE"

export APP_IMAGE="$PRE_IMAGE"
export LIVE_UPSTREAM="$(cat "$RELEASE_DIR/live-upstream.txt" 2>/dev/null || printf '%s' 'app_live_blue:5056')"

docker compose -f "$COMPOSE_FILE" up -d db_live db_pre
sh scripts/clone-db-for-prerelease.sh
sh scripts/clone-storage-for-prerelease.sh

export PRE_IMAGE
docker compose -f "$COMPOSE_FILE" pull app_pre
docker compose -f "$COMPOSE_FILE" run --rm app_pre npm run prisma:migrate
docker compose -f "$COMPOSE_FILE" up -d --no-deps app_pre caddy
docker compose -f "$COMPOSE_FILE" exec -T caddy caddy validate --config /etc/caddy/Caddyfile

sleep 5

echo "Checking prerelease container health internally..."
i=1
max=5
while [ "$i" -le "$max" ]; do
  if docker compose -f "$COMPOSE_FILE" exec -T app_pre wget -qO- http://localhost:5056/api/health >/dev/null 2>&1; then
    echo "Prerelease container is healthy"
    break
  fi

  if [ "$i" -eq "$max" ]; then
    echo "Prerelease container failed internal health check"
    docker compose -f "$COMPOSE_FILE" ps
    docker compose -f "$COMPOSE_FILE" logs --tail=200 app_pre
    exit 1
  fi

  echo "Waiting prerelease internal health $i/$max"
  i=$((i + 1))
  sleep 5
done

echo "Checking prerelease storage routes..."
i=1
max=5
while [ "$i" -le "$max" ]; do
  if curl --connect-timeout 5 --max-time 10 -fsS "https://$PRE_STORAGE_DOMAIN/minio/health/live" >/dev/null 2>&1 \
    && curl --connect-timeout 5 --max-time 10 -fsSI "https://$PRE_STORAGE_CONSOLE_DOMAIN/" >/dev/null 2>&1; then
    echo "Prerelease storage routes are healthy"
    break
  fi

  if [ "$i" -eq "$max" ]; then
    echo "Prerelease storage route failed. Check DNS, Caddy TLS, and MinIO console routing for $PRE_STORAGE_DOMAIN and $PRE_STORAGE_CONSOLE_DOMAIN."
    docker compose -f "$COMPOSE_FILE" ps
    docker compose -f "$COMPOSE_FILE" logs --tail=200 caddy
    docker compose -f "$COMPOSE_FILE" logs --tail=200 minio_pre
    exit 1
  fi

  echo "Waiting prerelease storage routes $i/$max"
  i=$((i + 1))
  sleep 5
done

echo "Checking prerelease public health..."
i=1
max=5
while [ "$i" -le "$max" ]; do
  if curl --connect-timeout 5 --max-time 10 -fsS "https://$PRE_DOMAIN/api/health" >/dev/null 2>&1; then
    printf '%s\n' "$PRE_IMAGE" > "$RELEASE_DIR/prerelease-green-image.txt"
    echo "Prerelease is healthy: $PRE_IMAGE"
    exit 0
  fi

  if [ "$i" -eq "$max" ]; then
    echo "Prerelease public health failed. Container is healthy, so check DNS/Caddy routing for $PRE_DOMAIN."
    docker compose -f "$COMPOSE_FILE" ps
    docker compose -f "$COMPOSE_FILE" logs --tail=200 caddy
    exit 1
  fi

  echo "Waiting prerelease public health $i/$max"
  i=$((i + 1))
  sleep 5
done
