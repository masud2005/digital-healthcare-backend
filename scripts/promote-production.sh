#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
LIVE_DOMAIN="${LIVE_DOMAIN:-prod.weightlossmdcherrycreek.com}"
RELEASE_DIR="${RELEASE_DIR:-./releases}"

mkdir -p "$RELEASE_DIR"

if [ ! -s "$RELEASE_DIR/prerelease-green-image.txt" ]; then
  echo "Missing $RELEASE_DIR/prerelease-green-image.txt. Deploy and verify prerelease first."
  exit 1
fi

PROMOTE_IMAGE="$(cat "$RELEASE_DIR/prerelease-green-image.txt")"
ACTIVE_COLOR="$(cat "$RELEASE_DIR/active-color.txt" 2>/dev/null || printf '%s' 'blue')"

if [ "$ACTIVE_COLOR" = "blue" ]; then
  NEXT_COLOR="green"
  NEXT_SERVICE="app_live_green"
  NEXT_UPSTREAM="app_live_green:5056"
  export BLUE_IMAGE="$(cat "$RELEASE_DIR/current-prod-image.txt" 2>/dev/null || printf '%s' "$PROMOTE_IMAGE")"
  export GREEN_IMAGE="$PROMOTE_IMAGE"
else
  NEXT_COLOR="blue"
  NEXT_SERVICE="app_live_blue"
  NEXT_UPSTREAM="app_live_blue:5056"
  export BLUE_IMAGE="$PROMOTE_IMAGE"
  export GREEN_IMAGE="$(cat "$RELEASE_DIR/current-prod-image.txt" 2>/dev/null || printf '%s' "$PROMOTE_IMAGE")"
fi

export APP_IMAGE="$PROMOTE_IMAGE"
export LIVE_UPSTREAM="$(cat "$RELEASE_DIR/live-upstream.txt" 2>/dev/null || printf '%s' 'app_live_blue:5056')"

echo "Promoting image to production $NEXT_COLOR: $PROMOTE_IMAGE"

docker compose -f "$COMPOSE_FILE" up -d db_live
docker compose -f "$COMPOSE_FILE" pull "$NEXT_SERVICE"
docker compose -f "$COMPOSE_FILE" run --rm "$NEXT_SERVICE" npm run prisma:migrate
docker compose -f "$COMPOSE_FILE" up -d --no-deps "$NEXT_SERVICE"

i=1
max=30
while [ "$i" -le "$max" ]; do
  if docker compose -f "$COMPOSE_FILE" exec -T "$NEXT_SERVICE" wget -qO- http://localhost:5056/api/health >/dev/null 2>&1; then
    echo "Production $NEXT_COLOR container is healthy"
    break
  fi

  if [ "$i" -eq "$max" ]; then
    echo "Production $NEXT_COLOR container failed health check"
    docker compose -f "$COMPOSE_FILE" logs --tail=200 "$NEXT_SERVICE"
    exit 1
  fi

  echo "Waiting production $NEXT_COLOR health $i/$max"
  i=$((i + 1))
  sleep 5
done

CURRENT_IMAGE="$(cat "$RELEASE_DIR/current-prod-image.txt" 2>/dev/null || true)"
if [ -n "$CURRENT_IMAGE" ]; then
  printf '%s\n' "$CURRENT_IMAGE" > "$RELEASE_DIR/previous-prod-image.txt"
fi

export LIVE_UPSTREAM="$NEXT_UPSTREAM"
printf '%s\n' "$LIVE_UPSTREAM" > "$RELEASE_DIR/live-upstream.txt"

docker compose -f "$COMPOSE_FILE" up -d --no-deps --force-recreate caddy

i=1
max=30
while [ "$i" -le "$max" ]; do
  if curl -fsS "https://$LIVE_DOMAIN/api/health" >/dev/null 2>&1; then
    printf '%s\n' "$NEXT_COLOR" > "$RELEASE_DIR/active-color.txt"
    printf '%s\n' "$PROMOTE_IMAGE" > "$RELEASE_DIR/current-prod-image.txt"
    echo "Production is healthy on $NEXT_COLOR: $PROMOTE_IMAGE"
    exit 0
  fi

  echo "Waiting public production health $i/$max"
  i=$((i + 1))
  sleep 5
done

echo "Public production health failed after switching to $NEXT_COLOR"
sh scripts/rollback-production.sh
exit 1
