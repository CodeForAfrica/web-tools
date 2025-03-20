DOCKER_BUILDKIT=1
DOCKER_BUILDKIT_PROGRESS=plain

lint.py:
	pylint server

requirements-local.py:
	pip install -q -r requirements/local.txt --exists-action w

tools-dev:
	DOCKER_BUILDKIT=$(DOCKER_BUILDKIT) DOCKER_BUILDKIT_PROGRESS=$(DOCKER_BUILDKIT_PROGRESS) SERVER_APP=tools-dev docker compose --env-file config/app.config up --build

sources-dev:
	DOCKER_BUILDKIT=$(DOCKER_BUILDKIT) DOCKER_BUILDKIT_PROGRESS=$(DOCKER_BUILDKIT_PROGRESS) SERVER_APP=sources-dev docker compose --env-file config/app.config up --build

explorer-dev:
	DOCKER_BUILDKIT=$(DOCKER_BUILDKIT) DOCKER_BUILDKIT_PROGRESS=$(DOCKER_BUILDKIT_PROGRESS) SERVER_APP=explorer-dev docker compose --env-file config/app.config up --build

topics-dev:
	DOCKER_BUILDKIT=$(DOCKER_BUILDKIT) DOCKER_BUILDKIT_PROGRESS=$(DOCKER_BUILDKIT_PROGRESS) SERVER_APP=topics-dev docker compose --env-file config/app.config up --build

release:
	docker buildx build --target flask-runner-prod --platform=$(PLATFORM) --build-arg SUPPORT_URL=$(SUPPORT_URL) -t $(IMAGE_TAG) .
