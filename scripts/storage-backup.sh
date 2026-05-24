#!/bin/bash

set -e 

VOLUME_NAME="minio_data"
BACKUP_DIR="/opt/minio-backup/backups"
DATE=$(date +%F_%H-%M-%S)
RETENTION_DAYS=7
MINIO_CONTAINER="${MINIO_CONTAINER:-minio-storage-live}"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

echo "===================================="
echo "Starting MinIO backup: $DATE"
echo "===================================="

# Step 1: Stop MinIO temporarily (IMPORTANT for data consistency)
echo "[1/4] Stopping MinIO container..."
docker stop "$MINIO_CONTAINER"

# Step 2: Create compressed backup from volume
echo "[2/4] Creating backup archive..."
docker run --rm \
  -v ${VOLUME_NAME}:/data \
  -v ${BACKUP_DIR}:/backup \
  alpine \
  tar czf /backup/minio_backup_${DATE}.tar.gz -C /data .

# Step 3: Start MinIO again
echo "[3/4] Starting MinIO container..."
docker start "$MINIO_CONTAINER"

# Step 4: Cleanup old backups
echo "[4/4] Cleaning up old backups (>${RETENTION_DAYS} days)..."
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "===================================="
echo "Backup completed successfully: minio_backup_${DATE}.tar.gz"
echo "===================================="
