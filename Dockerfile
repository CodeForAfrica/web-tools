###===========================================================================
### Python ###
FROM python:3.8.18-slim AS python-builder
RUN apt-get update && apt-get install -y build-essential libxml2-dev libxslt-dev
# set builder environment variables
ENV PIP_DEFAULT_TIMEOUT=100 \
    # don’t try to write .pyc files on the import of source modules
    PYTHONDONTWRITEBYTECODE=1 \
    # allow statements and log messages to immediately appear
    PYTHONUNBUFFERED=1 \
    # disable a pip version check to reduce run-time & log-spam
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    # cache is useless in docker image, so disable to reduce image size
    PIP_NO_CACHE_DIR=1 

WORKDIR /usr/src/app

# Install Python dependencies
COPY requirements.txt ./
COPY requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements.txt --progress-bar off



###===========================================================================
### React ###
FROM node:14 AS react-builder

ARG SUPPORT_URL
ENV SUPPORT_URL=${SUPPORT_URL}

WORKDIR /usr/src/app

# install React app dependencies
COPY package*.json ./
COPY config/webpack*.js ./config/


# Development stage
FROM node:14 AS react-dev-builder
ARG SUPPORT_URL
ENV SUPPORT_URL=${SUPPORT_URL}

WORKDIR /usr/src/app

# install React app dependencies
COPY package*.json ./
COPY config/webpack*.js ./config/
RUN npm install
COPY . .
RUN npm install --save-dev webpack-dev-server


# Production stage
FROM react-builder AS react-prod-builder
WORKDIR /usr/src/app
RUN npm install --omit=dev && npm cache clean --force
COPY . .
RUN npm run release-all


###===========================================================================
### PROD runner ###
FROM python:3.8.18-slim AS runner-prod

WORKDIR /usr/src/app

# copy built artifacts
COPY --from=react-prod-builder /usr/src/app/ /usr/src/app/
COPY --from=python-builder /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages
COPY --from=python-builder /usr/local/bin /usr/local/bin


RUN chmod +x ./run.sh
ENTRYPOINT ["./run.sh"]


###===========================================================================
### DEV runner ###
FROM python:3.8.18-slim AS runner-dev

WORKDIR /usr/src/app

COPY . .

# copy built artifacts
COPY --from=python-builder /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages
COPY --from=python-builder /usr/local/bin /usr/local/bin

RUN chmod +x ./run-dev.sh
ENTRYPOINT ["python", "run.py"]
