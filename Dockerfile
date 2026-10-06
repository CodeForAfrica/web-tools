###===========================================================================
### Python ###
FROM python:3.8.18-slim AS python

# upgrade system
RUN apt-get update \
    # Install security updates
    && apt-get upgrade -y

    # don’t try to write .pyc files on the import of source modules
ENV PYTHONDONTWRITEBYTECODE=1 \
    # allow statements and log messages to immediately appear
    PYTHONUNBUFFERED=1 \
    APP_DOCKER_PATH=/usr/src/app \
    VIRTUAL_ENV=/opt/venv


###===========================================================================
### Flask Base builder ###
FROM python AS flask-builder-base
RUN apt-get install -y \
    build-essential \
    libxml2-dev \
    libxslt-dev \
    python3-venv

# set builder environment variables
ENV PIP_DEFAULT_TIMEOUT=100 \
    # disable a pip version check to reduce run-time & log-spam
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    # cache is useless in docker image, so disable to reduce image size
    PIP_NO_CACHE_DIR=1

# Create and activate virtual environment
RUN python -m venv ${VIRTUAL_ENV}
ENV PATH="${VIRTUAL_ENV}/bin:$PATH"

WORKDIR ${APP_DOCKER_PATH}

# Install Python dependencies
COPY requirements.txt ./
COPY requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements.txt --progress-bar off



###===========================================================================
### React ###
FROM node:14 AS react
WORKDIR /usr/src/app

# Copy necessary files for installing node_modules
COPY package*.json ./
COPY config/webpack*.js ./config/
ENV APP_HOME=/usr/src/app

###===========================================================================
## React DEV build stage
FROM react AS react-builder-dev

ARG SUPPORT_URL
ENV SUPPORT_URL=${SUPPORT_URL}

WORKDIR ${APP_HOME}

# Install dependencies
RUN npm install --save-dev webpack-dev-server
COPY . .

# Get the app name
ARG SERVER_APP
ENV SERVER_APP=${SERVER_APP}

ENTRYPOINT npm run ${SERVER_APP}


###===========================================================================
## React PROD build stage
FROM react AS react-builder-prod

ARG SUPPORT_URL

WORKDIR /usr/src/app

# Install dependencies
RUN HUSKY_SKIP_INSTALL=1 npm ci --no-audit --no-fund && npm cache clean --force
COPY src/ ./src/
COPY config/ ./config/
COPY server/static/ ./server/static/
COPY .babelrc .eslintrc .eslintignore ./
RUN mkdir -p server/static/gen/tools server/static/gen/explorer server/static/gen/topics server/static/gen/sources \
    && npm run release-all


###===========================================================================
### Python Base runner ###
FROM python AS flask-runner-base

WORKDIR ${APP_DOCKER_PATH}


###===========================================================================
### Flask DEV runner ###
FROM flask-runner-base AS flask-runner-dev

COPY . .

# copy built artifacts
COPY --from=flask-builder-base ${VIRTUAL_ENV} ${VIRTUAL_ENV}
ENV PATH="${VIRTUAL_ENV}/bin:$PATH"

ENTRYPOINT ["python", "run.py"]

###===========================================================================
### Flask PROD runner ###
FROM flask-runner-base AS flask-runner-prod

# copy built artifacts
COPY . .
COPY --from=react-builder-prod /usr/src/app/server/static/gen/ /usr/src/app/server/static/gen/
COPY --from=flask-builder-base ${VIRTUAL_ENV} ${VIRTUAL_ENV}
ENV PATH="${VIRTUAL_ENV}/bin:$PATH"


RUN chmod +x ./run.sh
ENTRYPOINT ["./run.sh"]

# All four tools share this image and external MongoDB/Redis URLs.
FROM flask-runner-prod AS web-tools-runner
USER root
RUN apt-get update && apt-get install -y --no-install-recommends nginx tini curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --gid 1000 webtools && useradd --uid 1000 --gid 1000 --create-home webtools \
    && mkdir -p logs /tmp/webtools \
    && chown -R 1000:1000 logs /tmp/webtools
COPY docker/webtools.py /usr/local/bin/webtools.py
USER 1000:1000
EXPOSE 8080
HEALTHCHECK --interval=20s --timeout=10s --start-period=60s --retries=3 \
    CMD python /usr/local/bin/webtools.py --healthcheck
ENTRYPOINT ["/usr/bin/tini", "--", "python", "/usr/local/bin/webtools.py"]
