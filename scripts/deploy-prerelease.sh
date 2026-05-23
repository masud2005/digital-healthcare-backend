#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
PRE_IMAGE="${PRE_IMAGE:?set PRE_IMAGE}"
PRE_DOMAIN="${PRE_DOMAIN:-pre.weightlossmdcherrycreek.com}"
RELEASE_DIR="${RELEASE_DIR:-./releases}"

mkdir -p "$RELEASE_DIR"

echo "Deploying prerelease image: $PRE_IMAGE"

export APP_IMAGE="$PRE_IMAGE"
export LIVE_UPSTREAM="$(cat "$RELEASE_DIR/live-upstream.txt" 2>/dev/null || printf '%s' 'app_live_blue:5056')"

docker compose -f "$COMPOSE_FILE" up -d db_live db_pre
sh scripts/clone-db-for-prerelease.sh

export PRE_IMAGE
docker compose -f "$COMPOSE_FILE" pull app_pre
docker compose -f "$COMPOSE_FILE" run --rm app_pre npm run prisma:migrate
docker compose -f "$COMPOSE_FILE" up -d --no-deps app_pre caddy

i=1
max=30
while [ "$i" -le "$max" ]; do
  if curl -fsS "https://$PRE_DOMAIN/api/health" >/dev/null 2>&1; then
    printf '%s\n' "$PRE_IMAGE" > "$RELEASE_DIR/prerelease-green-image.txt"
    echo "Prerelease is healthy: $PRE_IMAGE"
    exit 0
  fi

  echo "Waiting prerelease health $i/$max"
  i=$((i + 1))
  sleep 5
done

echo "Prerelease failed health check"
docker compose -f "$COMPOSE_FILE" logs --tail=200 app_pre
exit 1
