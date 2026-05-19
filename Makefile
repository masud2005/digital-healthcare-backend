build-dev:
	docker compose -f docker-compose.dev.yaml --profile dev build

start-dev:
	docker compose -f docker-compose.dev.yaml --profile dev up -d

build-prod:
	docker compose -f docker-compose.yaml --profile prod build

start-prod:
	docker compose -f docker-compose.yaml --profile prod up -d

stop-dev:
	docker compose -f docker-compose.dev.yaml --profile dev down --remove-orphans

stop-prod:
	docker compose -f docker-compose.yaml --profile prod down --remove-orphans

########
storage-up:
	docker compose -f docker-compose.storage.yaml up -d --remove-orphans

storage-down:
	docker compose -f docker-compose.storage.yaml down --remove-orphans