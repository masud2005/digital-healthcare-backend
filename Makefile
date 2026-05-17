build-dev:
	docker compose -f docker-compose.dev.yaml build

start-dev:
	docker compose -f docker-compose.dev.yaml up -d

build-prod:
	docker compose -f docker-compose.yaml build --no-cache

start-prod:
	docker compose -f docker-compose.yaml up -d

stop-dev:
	docker compose -f docker-compose.dev.yaml down --remove-orphans

stop-prod:
	docker compose -f docker-compose.yaml down --remove-orphans