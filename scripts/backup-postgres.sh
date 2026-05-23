#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
DB_USER="${POSTGRES_USER:-doc}"
DB_NAME="${POSTGRES_DB:-doc}"
BACKUP_DIR="${BACKUP_DIR:-/home/admin/backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DATE="$(date +%F_%H-%M-%S)"

mkdir -p "$BACKUP_DIR"

echo "Starting PostgreSQL backup for $DB_NAME at $DATE"

docker compose -f "$COMPOSE_FILE" up -d db_live

until docker compose -f "$COMPOSE_FILE" exec -T db_live pg_isready -U "$DB_USER" -d "$DB_NAME"; do
  sleep 1
done

docker compose -f "$COMPOSE_FILE" exec -T db_live \
  pg_dump -U "$DB_USER" --format=custom --no-owner --no-privileges "$DB_NAME" \
  > "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

find "$BACKUP_DIR" -type f -name "${DB_NAME}_*.dump" -mtime +"$RETENTION_DAYS" -delete

echo "PostgreSQL backup completed: $BACKUP_DIR/${DB_NAME}_${DATE}.dump"
