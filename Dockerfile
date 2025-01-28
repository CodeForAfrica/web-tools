FROM python:3.8.18 AS python_builder
WORKDIR /usr/src/app
COPY requirements.txt ./
COPY requirements/ ./requirements/
RUN pip install --no-cache-dir -r requirements.txt


FROM node:10.24.1 AS node_base_builder
WORKDIR /usr/src/app
COPY --from=python_builder /usr/src/app/ .
COPY package*.json ./
COPY config/webpack*.js ./config/
RUN npm install --omit=dev
COPY . .

FROM node:10.24.1 AS tools_release
WORKDIR /usr/src/app
COPY --from=node_base_builder /usr/src/app/ /usr/src/app/
RUN npm run tools-release

FROM python:3.8.18 AS tools_runner
WORKDIR /usr/src/app
COPY --from=tools_release /usr/src/app/ /usr/src/app/
COPY --from=python_builder /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages
COPY --from=python_builder /usr/local/bin /usr/local/bin
CMD ["/bin/bash", "./run.sh"]
