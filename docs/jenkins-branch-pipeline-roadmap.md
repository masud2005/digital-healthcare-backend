# Jenkins Branch Pipeline Roadmap

This roadmap is for the current NestJS, Prisma, TypeScript, PostgreSQL, Docker, Caddy, and Jenkins setup in this repository.

Target domains:

- Prerelease: `pre.weightlossmdcherrycreek.com`
- Production: `prod.weightlossmdcherrycreek.com`

Branch behavior:

- `dev`: build, test, create Docker image, push to Docker Hub.
- `master`: deploy prerelease from a Docker Hub image, clone production database into prerelease database, run health checks, keep production untouched.
- `main`: promote the latest prerelease-green image to production with zero-downtime blue/green deployment.

The production database is the source of truth. Prerelease must use a clone of production data, but prerelease writes must never affect production.

## Current Repo Starting Point

Already present:

- `Dockerfile` builds the NestJS app and validates/generates Prisma.
- `Jenkinsfile` builds and pushes Docker images.
- `docker-compose.release.yaml` has `app_live_blue`, `app_live_green`, `app_pre`, `db_live`, `db_pre`, `minio`, and `caddy`.
- `Caddyfile` routes domains to internal app containers.
- `src/health.controller.ts` exposes `GET /api/health`.
- `scripts/clone-db-for-prerelease.sh` refreshes `db_pre` from `db_live`.
- `scripts/storage-backup.sh` backs up MinIO storage volume.

Server setup still required before production:

- Point DNS for `pre.weightlossmdcherrycreek.com` and `prod.weightlossmdcherrycreek.com` to the VPS.
- Create the Jenkins credentials listed below.
- Confirm `.env.production` uses `db_live` and `.env.prerelease` uses `db_pre`.
- Schedule `scripts/backup-postgres.sh` in cron.
- Test one prerelease deployment and one rollback during a low-traffic window.

## Phase 1: Server Foundation

Prepare one VPS with Docker and Docker Compose. Only Caddy should expose public ports.

Public ports:

- `80`
- `443`

Do not expose:

- NestJS app port `5056`
- PostgreSQL port `5432`
- MinIO ports `9000` and `9001`

Recommended server directory:

```sh
/root/projects/doc-backend
```

Files required on the server:

```text
Caddyfile
docker-compose.release.yaml
scripts/clone-db-for-prerelease.sh
scripts/backup-postgres.sh
.env.production
.env.prerelease
```

Production env must point to `db_live`:

```env
NODE_ENV=production
PORT=5056
DATABASE_URL=postgresql://doc:<password>@db_live:5432/doc
```

Prerelease env must point to `db_pre`:

```env
NODE_ENV=staging
PORT=5056
DATABASE_URL=postgresql://doc:<password>@db_pre:5432/doc
```

## Phase 2: Caddy Routing

Caddy should be the only public entry point.

Implemented Caddyfile:

```caddyfile
prod.weightlossmdcherrycreek.com {
    reverse_proxy {$LIVE_UPSTREAM:app_live_blue:5056}
}

pre.weightlossmdcherrycreek.com {
    reverse_proxy app_pre:5056
}
```

For a simpler first production release, production can route to only one active container. For true zero downtime, keep two production app containers:

- `app_live_blue`
- `app_live_green`

The deployment scripts update `LIVE_UPSTREAM` only after the new color passes `/api/health`.

## Phase 3: Docker Compose Shape

Keep separate databases:

- `db_live`: real production database using the real production volume.
- `db_pre`: cloned prerelease database using an isolated prerelease volume.

Keep separate apps:

- `app_pre`: prerelease app using `.env.prerelease`.
- `app_live_blue`: production app candidate color using `.env.production`.
- `app_live_green`: production app candidate color using `.env.production`.

All services must share an internal Docker network. App and database services should not publish ports.

Important compose rule:

```yaml
networks:
  doc_release:
    internal: false
```

Caddy needs internet access for TLS, so the network cannot be fully internal unless Caddy also has an external network. The security goal is achieved by publishing ports only on Caddy.

## Phase 4: Jenkins Credentials

Create these Jenkins credentials:

- `dockerhub-creds`: Docker Hub username/password.
- `doc-vps-ssh`: SSH private key for the VPS user.
- `doc-backend-env-production`: secret file for `.env.production`.
- `doc-backend-env-prerelease`: secret file for `.env.prerelease`.
- `doc-backend-postgres-password`: secret text for PostgreSQL password if not stored in env files.

Recommended Jenkins environment values:

```groovy
APP_NAME = 'doc-backend'
DOCKER_IMAGE = 'softvence/doc-backend'
VPS_HOST = '<server-ip-or-hostname>'
VPS_USER = 'admin'
LIVE_DOMAIN = 'prod.weightlossmdcherrycreek.com'
PRE_DOMAIN = 'pre.weightlossmdcherrycreek.com'
SERVER_DIR = '/root/projects/doc-backend'
COMPOSE_FILE = 'docker-compose.release.yaml'
```

## Phase 5: `dev` Branch Pipeline

Goal: every merge to `dev` creates a Docker image and pushes it to Docker Hub.

Stages:

1. Checkout.
2. Install dependencies.
3. Run quality checks:

```sh
npm run prisma:validate
npm run prisma:generate
npm run build
```

`npm run format` and `npm run lint` should be added back to the blocking Jenkins quality gate after the existing formatting and lint debt in the application source is cleaned up.

4. Build immutable image:

```text
softvence/doc-backend:dev-<build-number>-<git-sha>
```

5. Push image to Docker Hub.
6. Also update:

```text
softvence/doc-backend:dev
```

This branch should not deploy to the VPS automatically unless you later add a separate development environment.

## Phase 6: `master` Prerelease Pipeline

Goal: when code merges to `master`, deploy a prerelease version at `pre.weightlossmdcherrycreek.com`.

Recommended behavior:

1. Build and push image:

```text
softvence/doc-backend:master-<build-number>-<git-sha>
```

2. SSH into the server.
3. Pull the candidate image.
4. Start `db_live` and `db_pre`.
5. Clone production database into prerelease:

```sh
sh scripts/clone-db-for-prerelease.sh
```

6. Run Prisma migrations against `db_pre` only:

```sh
docker compose -f docker-compose.release.yaml run --rm app_pre npm run prisma:migrate
```

7. Start `app_pre` with the candidate image.
8. Check:

```sh
curl -fsS https://pre.weightlossmdcherrycreek.com/api/health
```

9. If healthy, write the image tag to:

```text
/root/projects/doc-backend/releases/prerelease-green-image.txt
```

10. If unhealthy, keep the previous prerelease container running and mark the Jenkins build failed.

Data safety rule:

- `clone-db-for-prerelease.sh` must only read from `db_live`.
- It can drop and recreate only `db_pre`.
- It must never drop, migrate, or write into `db_live`.

## Phase 7: Human Verification

Before production, test prerelease with real production-shaped data:

- Login/auth flow.
- Assessment submission flow.
- Admin question/product/category/assessment flows.
- Website settings flow.
- File upload or MinIO-backed storage flow if used.
- API docs route if needed.
- Error logs from the prerelease container.

Acceptance criteria:

- `pre.weightlossmdcherrycreek.com/api/health` returns `200`.
- No Prisma migration errors.
- No repeated app restarts.
- No unexpected writes to production database.
- Product owner or technical lead approves release.

## Phase 8: `main` Production Promotion Pipeline

Goal: when code merges to `main`, deploy the same image that passed prerelease.

Do not rebuild a different production image on `main`. Read this file from the server:

```text
/root/projects/doc-backend/releases/prerelease-green-image.txt
```

Use that exact image for production.

Production deployment stages:

1. SSH into server.
2. Read current active color:

```text
/root/projects/doc-backend/releases/active-color.txt
```

3. Choose inactive color:

- active `blue` means deploy `green`
- active `green` means deploy `blue`

4. Store current known-good image before deployment:

```text
/root/projects/doc-backend/releases/previous-prod-image.txt
```

5. Pull prerelease-green image.
6. Run production-safe Prisma migrations against `db_live`:

```sh
docker compose -f docker-compose.release.yaml run --rm app_live_green npm run prisma:migrate
```

Use the inactive color service for the command. Both production colors must use `.env.production`.

7. Start inactive color with the promoted image.
8. Health check the inactive color internally:

```sh
docker compose -f docker-compose.release.yaml exec -T app_live_green wget -qO- http://localhost:5056/api/health
```

9. If healthy, update Caddy routing or active color config.
10. Reload Caddy:

```sh
docker compose -f docker-compose.release.yaml exec -T caddy caddy reload --config /etc/caddy/Caddyfile
```

11. Check public health:

```sh
curl -fsS https://prod.weightlossmdcherrycreek.com/api/health
```

12. If public health is green, write:

```text
/root/projects/doc-backend/releases/active-color.txt
/root/projects/doc-backend/releases/current-prod-image.txt
```

13. Stop old color only after the new color is confirmed stable.

## Phase 9: Rollback Strategy

Rollback must use the last known good image, not a new build.

Rollback inputs:

```text
/root/projects/doc-backend/releases/previous-prod-image.txt
/root/projects/doc-backend/releases/active-color.txt
```

Rollback steps:

1. Start inactive color with `previous-prod-image.txt`.
2. Health check inactive color.
3. Switch Caddy back to the rollback color.
4. Reload Caddy.
5. Check public production health.
6. Mark rollback image as current production image.

Database rollback warning:

- App rollback is fast.
- Database rollback is not always safe after destructive migrations.
- Avoid destructive migrations in production releases.
- Use expand-and-contract migrations so the previous app version can still run after migration.

## Phase 10: Daily Database Backup

Add a PostgreSQL backup script for the production database volume. Prefer logical backups with `pg_dump`, because they are portable across servers.

Recommended file:

```text
scripts/backup-postgres.sh
```

Recommended behavior:

```sh
#!/usr/bin/env sh
set -eu

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.release.yaml}"
DB_USER="${POSTGRES_USER:-doc}"
DB_NAME="${POSTGRES_DB:-doc}"
BACKUP_DIR="${BACKUP_DIR:-/root//backups/postgres}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
DATE="$(date +%F_%H-%M-%S)"

mkdir -p "$BACKUP_DIR"

docker compose -f "$COMPOSE_FILE" exec -T db_live \
  pg_dump -U "$DB_USER" --format=custom --no-owner --no-privileges "$DB_NAME" \
  > "$BACKUP_DIR/${DB_NAME}_${DATE}.dump"

find "$BACKUP_DIR" -type f -name "${DB_NAME}_*.dump" -mtime +"$RETENTION_DAYS" -delete
```

Server cron:

```cron
0 2 * * * cd /root/projects/doc-backend && /bin/sh scripts/backup-postgres.sh >> /root//backups/postgres/backup.log 2>&1
```

Also back up uploaded files or object storage. The existing `scripts/storage-backup.sh` covers MinIO volume backup, but it temporarily stops MinIO. For production, prefer S3-compatible bucket replication or a MinIO client mirror job if uploads must remain available during backup.

Backup verification:

- Restore the latest dump to a temporary database once per week.
- Run `npx prisma migrate status` or an app smoke test against the restored database.
- Keep at least one off-server copy.

## Phase 11: Jenkinsfile Changes Needed

Update the current `Jenkinsfile` so branch rules are explicit:

- Build and push only for `dev`, `master`, and approved release branches.
- `dev` stops after Docker Hub push.
- `master` deploys prerelease and writes `prerelease-green-image.txt` after health passes.
- `main` reads `prerelease-green-image.txt` and promotes that exact image.
- Production deployment uses blue/green services.
- Rollback uses `previous-prod-image.txt` if health fails.

Recommended high-level Jenkins stages:

```text
Checkout
Quality Gate
Build Image
Push Image
Deploy Prerelease       only master
Verify Prerelease       only master
Mark Prerelease Green   only master
Promote Production      only main
Verify Production       only main
Rollback Production     only main failure
```

## Phase 12: Go-Live Checklist

DNS:

- `pre.weightlossmdcherrycreek.com` points to the VPS.
- `prod.weightlossmdcherrycreek.com` points to the VPS.

Security:

- Only ports `80` and `443` are public.
- PostgreSQL is not public.
- App containers are not public.
- MinIO is not public unless routed through Caddy with authentication.
- `.env.production` and `.env.prerelease` are Jenkins secret files or server-only files.

Data:

- Production database volume exists and is mounted only by `db_live`.
- Prerelease database volume is separate.
- Prerelease clone was tested.
- Daily production database backup is scheduled.
- Restore test was completed.

Release:

- `/api/health` works internally and publicly.
- First prerelease deployment is tested.
- First production deployment is done during a low-traffic window.
- Rollback command has been tested with a harmless previous image.

## Final Target Flow

```text
dev merge
  -> Jenkins builds image
  -> Docker Hub push

master merge
  -> Jenkins builds image
  -> Docker Hub push
  -> clone prod DB to prerelease DB
  -> migrate prerelease DB
  -> deploy prerelease
  -> health check
  -> mark image as prerelease-green

main merge
  -> read prerelease-green image
  -> migrate production DB safely
  -> deploy inactive production color
  -> health check inactive color
  -> switch Caddy to new color
  -> public health check
  -> keep previous image for rollback
```
