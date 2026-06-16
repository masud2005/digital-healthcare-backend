#!/usr/bin/env bash
set -euo pipefail

# Source project environment variables if .env exists
if [ -f .env ]; then
  ENV_LINES=$(grep -v '^#' .env | xargs)
  if [ -n "$ENV_LINES" ]; then
    export $ENV_LINES
  fi
fi

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
DB_USER="${POSTGRES_USER:-doc}"
DB_NAME="${POSTGRES_DB:-doc}"

echo "Resetting prerelease database from the current live database..."

docker compose -f "$COMPOSE_FILE" up -d db_live db_pre

echo "Waiting for databases to initialize..."
until docker compose -f "$COMPOSE_FILE" exec -T db_live pg_isready -U "$DB_USER"; do
  sleep 1
done

until docker compose -f "$COMPOSE_FILE" exec -T db_pre pg_isready -U "$DB_USER"; do
  sleep 1
done


docker compose -f "$COMPOSE_FILE" exec -T db_pre \
    env PGPASSWORD="${POSTGRES_PASSWORD:-doc}" \
    psql -U "$DB_USER" -d postgres -v ON_ERROR_STOP=1 \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME';"

docker compose -f "$COMPOSE_FILE" exec -T db_pre \
    env PGPASSWORD="${POSTGRES_PASSWORD:-doc}" \
    dropdb -U "$DB_USER" --if-exists "$DB_NAME"

docker compose -f "$COMPOSE_FILE" exec -T db_pre \
    env PGPASSWORD="${POSTGRES_PASSWORD:-doc}" \
    createdb -U "$DB_USER" "$DB_NAME"

docker compose -f "$COMPOSE_FILE" exec -T db_live \
    env PGPASSWORD="${POSTGRES_PASSWORD:-doc}" \
    pg_dump -U "$DB_USER" --clean --if-exists --no-owner --no-privileges "$DB_NAME" \
    | docker compose -f "$COMPOSE_FILE" exec -T db_pre \
        env PGPASSWORD="${POSTGRES_PASSWORD:-doc}" \
        psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1

echo "Prerelease database is now a fresh clone of live."
