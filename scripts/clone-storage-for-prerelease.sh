#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
MINIO_USER="${MINIO_ROOT_USER:-admin}"
MINIO_PASS="${MINIO_ROOT_PASSWORD:-admin123}"
MINIO_BUCKET="${MINIO_BUCKET:-testing}"

echo "Resetting prerelease storage from live storage bucket: $MINIO_BUCKET"

docker compose -f "$COMPOSE_FILE" up -d minio_live minio_pre

echo "Waiting for MinIO services..."
until docker compose -f "$COMPOSE_FILE" exec -T minio_live curl -fsS http://localhost:9000/minio/health/live >/dev/null; do
  sleep 1
done

until docker compose -f "$COMPOSE_FILE" exec -T minio_pre curl -fsS http://localhost:9000/minio/health/live >/dev/null; do
  sleep 1
done

docker run --rm --network doc-backend_doc_release \
  --entrypoint /bin/sh \
  -e MINIO_USER="$MINIO_USER" \
  -e MINIO_PASS="$MINIO_PASS" \
  -e MINIO_BUCKET="$MINIO_BUCKET" \
  minio/mc:latest -eu -c '
    mc alias set live http://minio_live:9000 "$MINIO_USER" "$MINIO_PASS"
    mc alias set pre http://minio_pre:9000 "$MINIO_USER" "$MINIO_PASS"

    mc mb --ignore-existing "live/$MINIO_BUCKET"
    mc mb --ignore-existing "pre/$MINIO_BUCKET"

    mc rm --recursive --force "pre/$MINIO_BUCKET" || true
    mc mirror --overwrite --remove "live/$MINIO_BUCKET" "pre/$MINIO_BUCKET"
  '

echo "Prerelease storage is now a fresh mirror of live storage."
