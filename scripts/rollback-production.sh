#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
LIVE_DOMAIN="${LIVE_DOMAIN:-prod.weightlossmdcherrycreek.com}"
export HEALTH_PATH="${HEALTH_PATH:-/api/v1/api/health}"
RELEASE_DIR="${RELEASE_DIR:-./releases}"

if [ ! -s "$RELEASE_DIR/previous-prod-image.txt" ]; then
  echo "Missing $RELEASE_DIR/previous-prod-image.txt. No known previous production image to roll back to."
  exit 1
fi

ROLLBACK_IMAGE="$(cat "$RELEASE_DIR/previous-prod-image.txt")"
ACTIVE_COLOR="$(cat "$RELEASE_DIR/active-color.txt" 2>/dev/null || printf '%s' 'blue')"

if [ "$ACTIVE_COLOR" = "blue" ]; then
  NEXT_COLOR="green"
  NEXT_SERVICE="app_live_green"
  NEXT_UPSTREAM="app_live_green:5056"
  export BLUE_IMAGE="$(cat "$RELEASE_DIR/current-prod-image.txt" 2>/dev/null || printf '%s' "$ROLLBACK_IMAGE")"
  export GREEN_IMAGE="$ROLLBACK_IMAGE"
else
  NEXT_COLOR="blue"
  NEXT_SERVICE="app_live_blue"
  NEXT_UPSTREAM="app_live_blue:5056"
  export BLUE_IMAGE="$ROLLBACK_IMAGE"
  export GREEN_IMAGE="$(cat "$RELEASE_DIR/current-prod-image.txt" 2>/dev/null || printf '%s' "$ROLLBACK_IMAGE")"
fi

export APP_IMAGE="$ROLLBACK_IMAGE"
export LIVE_UPSTREAM="$(cat "$RELEASE_DIR/live-upstream.txt" 2>/dev/null || printf '%s' 'app_live_blue:5056')"

echo "Rolling back production to $NEXT_COLOR: $ROLLBACK_IMAGE"

docker compose -f "$COMPOSE_FILE" pull "$NEXT_SERVICE"
docker compose -f "$COMPOSE_FILE" up -d --no-deps "$NEXT_SERVICE"

i=1
max=30
while [ "$i" -le "$max" ]; do
  if docker compose -f "$COMPOSE_FILE" exec -T "$NEXT_SERVICE" wget -qO- "http://localhost:5056$HEALTH_PATH" >/dev/null 2>&1; then
    echo "Rollback container is healthy"
    break
  fi

  if [ "$i" -eq "$max" ]; then
    echo "Rollback container failed health check"
    docker compose -f "$COMPOSE_FILE" logs --tail=200 "$NEXT_SERVICE"
    exit 1
  fi

  echo "Waiting rollback health $i/$max"
  i=$((i + 1))
  sleep 5
done

export LIVE_UPSTREAM="$NEXT_UPSTREAM"
printf '%s\n' "$LIVE_UPSTREAM" > "$RELEASE_DIR/live-upstream.txt"
docker compose -f "$COMPOSE_FILE" up -d --no-deps --force-recreate caddy

i=1
max=30
while [ "$i" -le "$max" ]; do
  if curl -fsS "https://$LIVE_DOMAIN$HEALTH_PATH" >/dev/null 2>&1; then
    printf '%s\n' "$NEXT_COLOR" > "$RELEASE_DIR/active-color.txt"
    printf '%s\n' "$ROLLBACK_IMAGE" > "$RELEASE_DIR/current-prod-image.txt"
    echo "Rollback completed: $ROLLBACK_IMAGE"
    exit 0
  fi

  echo "Waiting public rollback health $i/$max"
  i=$((i + 1))
  sleep 5
done

echo "Rollback public health failed"
exit 1
