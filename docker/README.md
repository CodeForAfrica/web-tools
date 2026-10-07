# CivicSignal tools container

`web-tools-runner` packages Explorer, Source Manager, Topic Mapper and Tools in
one image. Four Gunicorn processes run behind nginx on port 8080. The hostname
selects the app. If a process exits, the supervisor stops the whole container;
the container health check verifies all four apps, MongoDB and session Redis.
The CivicSignal marketing website is excluded.

## Local startup

Copy `.env.example` to `.env`, then supply a backend API key, shared session
secret, and the existing Payload CMS URL and key. Keep `.env` private.

```sh
docker compose up --build --wait
```

MongoDB and Redis run as separate local containers with persistent named
volumes. Neither publishes its database port to the host. URLs can be replaced
with external URLs through `MONGO_URL` and `CFA_REDIS_URL` (or separate
`SESSION_REDIS_URL` and `CACHE_REDIS_URL` settings). The default Compose file also starts the backend from the neighboring checkout. PostgreSQL remains external.

The local apps are:

- http://explorer.civicsignal.localhost:8083
- http://sources.civicsignal.localhost:8083
- http://topics.civicsignal.localhost:8083
- http://tools.civicsignal.localhost:8083

For the backend and frontend together, with the backend checkout beside this
repository and its existing database URL in its environment file:

```sh
docker compose up --build --wait
```

Set `CIVICSIGNAL_BACKEND_REPO` and `CIVICSIGNAL_BACKEND_ENV` when the checkout or
its environment file is elsewhere. Defaults are `../backend` and
`../backend/.env`. PostgreSQL stays external: this command
starts the backend components, but does not create or migrate PostgreSQL.
`compose.yaml` points the tools at the backend's Compose service. To run only the frontend and its MongoDB/Redis stores against an already-running backend on host port 8082, use `docker compose -f compose.frontend.yaml up --build --wait`.

## ECS runtime contract

Build `Dockerfile` target `web-tools-runner` for `linux/amd64`. The single
container listens on 8080 and accepts these environment variables:

- `EXPLORER_URL`, `SOURCES_URL`, `TOPICS_URL`, `TOOLS_URL`: four distinct HTTP(S)
  origins; configure all four hostnames as aliases for the same ECS service.
- `COOKIE_DOMAIN`: their shared parent domain.
- `AUTH_MANAGEMENT_DOMAIN`: the Tools origin used for account links.
- `MEDIA_CLOUD_API_URL`: backend API origin including `/api/v2/`.
- `MONGO_URL`: MongoDB URL including its database name.
- `SESSION_REDIS_URL`, `CACHE_REDIS_URL`: session and cache URLs; use separate
  Redis database numbers or separate Redis instances.
- `MEDIA_CLOUD_API_KEY`, `SECRET_KEY`, `PAYLOAD_API_KEY`: secret values.
- `PAYLOAD_API_URL`: the existing CMS API URL. CMS stays externally hosted.
- `WEBTOOLS_LOG_STDOUT=1`: console logging without credential-level debug logs.
- Existing optional service settings (`CLIFF_URL`, `NYT_THEME_LABELLER_URL`,
  `WORD_EMBEDDINGS_SERVER_URL`, `CORENLP_URL`, SMTP and YouTube configuration)
  remain configurable. Supply reachable services for those features.

Use Secrets Manager references for connection URLs, API keys and session
secrets. Configure `/healthz` as the target-group health path. Allocate an
initial 1 GiB for this frontend container and measure under real traffic.
The tools belong in the existing CivicSignal stack as an additional ECS
service. The backend already uses ten containers, so they cannot be added to
that same task. ECS does not migrate MongoDB or Redis data automatically.

## Isolated verification

The backend fixture must be named `civicsignal_e2e`; the helper refuses other
databases. First run the backend's `dev/e2e/run.sh`, then copy and execute
`dev/e2e/fixture.py` inside its API container. It writes test credentials to
`/tmp/civicsignal-frontend-fixture.json` with mode 0600; copy that file to the
same local path and privately put its `api_key` and `secret` into
`.env.e2e.local` as `MEDIA_CLOUD_API_KEY` and `SECRET_KEY`. Set local CMS fixture
values for `PAYLOAD_API_URL` and `PAYLOAD_API_KEY` in that file.

```sh
docker compose --env-file .env.e2e.local -f compose.yaml -f compose.e2e.yaml up --build --wait
python3 -m unittest discover -s tests -p test_container_runtime.py
node dev/e2e/verify.cjs
```

The browser verifier requires Playwright and installed Google Chrome. It checks
browser login against the real backend, all four hostname routes, shared Redis
sessions, real source/topic API calls, indexed story search, MongoDB saved
searches, and JavaScript errors. `compose.e2e.yaml` supplies only CMS text as a
fixture; this does **not** validate the live CMS. Restart the frontend and run
with `CIVICSIGNAL_VERIFY_PERSISTENCE=1` to verify saved-search persistence.

## Deploy to dev

Run this repository's **deploy_to_dev** workflow manually after the CivicSignal
frontend infrastructure PR has been applied. Set repository variable
`CIVICSIGNAL_PULUMI_STACK` to
`tech-codeforafrica-org/cfa-platform-infra-civicsignal/dev` and make the existing
`PULUMI_ACCESS_TOKEN` organization secret available to this repository. Keep
`CFA_RUNNER_LABELS` configured for CFA runners.

The workflow reads the frontend-specific stack outputs, publishes one immutable
linux/amd64 image using the shared ECS release workflow, deploys only the
frontend service, and checks `/healthz` and `/` on Explorer, Sources, Topics and
Tools. `/healthz` checks all four Flask processes and MongoDB/session/cache
Redis connections; hostname checks verify the intended app is served. The
standard ECS deployment circuit breaker and shared release helper provide
rollback on service deployment failure. A later public-route health failure
fails the workflow for diagnosis; it does not itself initiate another rollback.

The backend repository owns its ten-container backend release independently.
Infrastructure provisions the frontend ECR/ECS service first; an unpublished
bootstrap image means an app release is still required.

High-cost workflow: manual only, one image, no architecture/build matrix,
CFA runners, superseded runs cancelled. The shared workflow retains its normal
image, build-cache, scan and attestation artifacts. Disable release execution
by removing the `workflow_dispatch` trigger.

Hosted dev configuration uses a database-scoped MongoDB Atlas URL and the
public HTTPS gateway for the `civicsignal-dev` Valkey tenant. Both connection
URLs are encrypted in Pulumi and injected through AWS Secrets Manager.
`CFA_REDIS_URL`, `SESSION_REDIS_URL` and `CACHE_REDIS_URL` refer to the same
tenant; session and cache keys have separate prefixes. Redis URLs support
username/password authentication. Credentials are injected at runtime and
never included in frontend bundles.

For hosted dev, `CFA_REDIS_URL` may be an HTTPS gateway URL such as
`https://civicsignal:TOKEN@civicsignal-dev-redis.codeforafrica.org` (placeholder
only). The session/cache adapter sends the token as a Bearer header, verifies TLS,
and uses the same Redis commands through the gateway. Binary cached values are
encoded for the JSON transport. Raw `redis://` URLs continue to work for Compose.
This HTTPS URL is an encrypted runtime secret; never put the token in repository
variables, public logs, or frontend JavaScript.

The image uses Python 3.11 and Flask 3.1 with patched runtime dependencies. Legacy
Python 3.7/3.8 environments must be recreated before installing these requirements.
Python build tooling is removed from the production runtime; application packages
are installed during the image build. Session-cookie handling and account ZIP
downloads use the current Flask APIs.

### Local dev release before merging the workflow

From this repository, resolve the applied frontend outputs, build/scan/publish one
image and deploy only the frontend service:

```sh
go run dev/deploy-local/main.go --infra-repo ../iac-cfa-pulumi --profile cfa-bootstrap
```

Use `--check` to validate live inputs without a release. `--local-image IMAGE`
uses an explicitly selected already-built linux/amd64 image; startup validation
and the security scan still run. The tool checks the account, frontend hostname,
container and task-family binding, uses the central ECS image-patching helper,
waits for service stability and restores a verified previous healthy task
revision on deployment failure. It then runs the same four-host public health
checks as the dev workflow. A later public-route failure fails the command for
diagnosis. This manual local path uses your AWS profile; OIDC, signing and
attestation are supplied by the shared GitHub workflow after merging, rather
than claimed as verified by a local release. It never creates or migrates the
backend database. High-cost execution remains manual, one image and one platform.
