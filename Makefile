lint.py:
	pylint server

requirements-local.py:
	pip install -q -r requirements/local.txt --exists-action w

tools-dev:
	SERVER_APP=tools-dev docker compose --env-file .env up --build

sources-dev:
	SERVER_APP=sources-dev docker compose --env-file .env up --build

explorer-dev:
	SERVER_APP=explorer-dev docker compose --env-file .env up --build

topics-dev:
	SERVER_APP=topics-dev docker compose --env-file .env up --build

release:
	docker buildx build --target runner-prod --platform=$(PLATFORM) --build-arg SUPPORT_URL=$(SUPPORT_URL) -t $(IMAGE_TAG) .
