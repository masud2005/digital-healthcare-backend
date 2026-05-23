# Zero-Downtime Release Plan

This project should run two permanent environments:

- **Live**: public production API, connected to the real production database, served by the active blue/green app container.
- **Prerelease**: private tester API, connected to a cloned database with the same production data.

Tester writes must never touch production. When prerelease is accepted, deploy the same tested image to live and point it at the production database. Do not copy prerelease database writes back to production unless there is a separate, deliberate data migration for that exact feature.

## Real-World Release Flow

1. Build one immutable Docker image for every commit, for example `softvence/doc-backend:2026-05-17-a1b2c3d`.
2. Deploy that image to `app_pre`.
3. Clone `db_live` into `db_pre`.
4. Run database migrations against `db_pre`.
5. Let humans test the prerelease URL.
6. After approval, run production-safe migrations against `db_live`.
7. Start the inactive production color, `app_live_blue` or `app_live_green`, with the exact same image that passed prerelease.
8. Wait for `/api/health` to pass.
9. Route traffic to the new live container.
10. Keep the previous image tag for quick rollback.

## Why This Is Safer

Production users never wait for build, install, Prisma generate, or container boot time. The new version is warmed up before traffic moves.

Prerelease uses real data shape, volume, and edge cases, but writes are isolated because it uses `db_pre`, not `db_live`.

The artifact promoted to production is the same Docker image tested by humans. This avoids the common mistake of rebuilding a slightly different version for production.

## Important Database Rule

Zero-downtime backend deployment depends on backward-compatible database changes.

Use the expand-and-contract pattern:

1. **Expand**: add nullable columns, new tables, new indexes, and dual-write code when needed.
2. **Deploy**: release code that can work with both old and new schema.
3. **Backfill**: migrate existing rows in a background job or controlled script.
4. **Contract**: only later remove old columns or old behavior after all running versions no longer need them.

Avoid these in the same release as app deployment:

- Dropping columns used by the current live app.
- Renaming columns without compatibility code.
- Adding `NOT NULL` columns without defaults or backfill.
- Long blocking migrations during peak traffic.

## Local/VPS Files Added

- `docker-compose.release.yaml`: runs blue/green live apps, prerelease app, live database, prerelease database, MinIO, and Caddy.
- `Caddyfile`: routes one domain to live and one domain to prerelease.
- `scripts/clone-db-for-prerelease.sh`: refreshes prerelease database from live.

## Environment Example

Set these on the server before running the release compose file:

```sh
export LIVE_DOMAIN=prod.weightlossmdcherrycreek.com
export PRE_DOMAIN=pre.weightlossmdcherrycreek.com
export APP_IMAGE=softvence/doc-backend:stable
export PRE_IMAGE=softvence/doc-backend:candidate
export POSTGRES_USER=doc
export POSTGRES_PASSWORD='change-me'
export POSTGRES_DB=doc
```

`.env.production` should point to the live database:

```env
DATABASE_URL=postgresql://doc:change-me@db_live:5432/doc
PORT=5056
```

`.env.prerelease` should point to the cloned prerelease database:

```env
DATABASE_URL=postgresql://doc:change-me@db_pre:5432/doc
PORT=5056
```

## Commands

Start the release stack:

```sh
docker compose -f docker-compose.release.yaml up -d
```

Refresh prerelease data from live:

```sh
sh scripts/clone-db-for-prerelease.sh
```

Run migrations for prerelease:

```sh
docker compose -f docker-compose.release.yaml run --rm app_pre npm run prisma:migrate
```

Promote the tested image to live:

```sh
export APP_IMAGE="$PRE_IMAGE"
sh scripts/promote-production.sh
curl -f https://$LIVE_DOMAIN/api/health
```

Rollback:

```sh
sh scripts/rollback-production.sh
curl -f https://$LIVE_DOMAIN/api/health
```

## Recommended Next Step

Move CI/CD to this sequence:

1. On every pull request: lint, build, Prisma validate, tests.
2. On merge to `dev`: build and push a candidate image.
3. On merge from `dev` to `master`: retag the already-built `dev` image as an immutable `master-<build>-<sha>` prerelease image.
4. Deploy candidate image to prerelease, clone live DB to prerelease DB, migrate prerelease DB.
5. On manual approval: run production migration, deploy the same candidate image to live.
6. Verify `/api/health`.

For bigger scale later, move this same pattern to Kubernetes with separate `Deployment`s, `Service`s, readiness probes, migration Jobs, and blue/green or canary traffic routing.

## Jenkins Setup

The included `Jenkinsfile` builds Docker images only from `dev`. On `master`, it pulls the existing `dev` image, retags it as an immutable prerelease image, deploys prerelease, marks the healthy prerelease image as green, and promotes that exact image to production from `main`.

If a GitLab push triggers Jenkins but the log immediately says `Finished: SUCCESS` without showing Pipeline stages, Jenkins is not reading the repository `Jenkinsfile`. Configure the job as **Pipeline script from SCM** with script path `Jenkinsfile`. See `docs/jenkins-job-setup.md`.

Create these Jenkins credentials:

- `dockerhub-creds`: username/password credential for Docker Hub.
- `doc-vps-ssh`: SSH username with private key for the VPS.
- `doc-backend-vps-host`: secret text containing the VPS hostname or IP.
- `doc-backend-vps-user`: secret text containing the VPS Linux username.
- `doc-backend-live-domain`: secret text such as `api.example.com`.
- `doc-backend-pre-domain`: secret text such as `pre-api.example.com`.
- `doc-backend-env-production`: secret file containing `.env.production`.
- `doc-backend-env-prerelease`: secret file containing `.env.prerelease`.

Install these Jenkins plugins:

- Docker Pipeline or a Jenkins agent with Docker CLI access.
- SSH Agent.
- Credentials Binding.
- Pipeline Utility Steps is useful but not required by this Jenkinsfile.

The Jenkins agent must have Node.js, npm, Docker, and network access to Docker Hub and the VPS.
