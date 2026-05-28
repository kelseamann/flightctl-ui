# Contributing to Flight Control UI

Thank you for working on this project—including forks used for UI development without access to a live Flight Control cluster. This guide covers setup, the **dev mock API** (offline mode), and how to extend fixtures safely.

For environment variable reference, see [CONFIGURATION.md](CONFIGURATION.md). For AI assistant conventions, see [AGENTS.md](AGENTS.md).

---

## Prerequisites

Install before developing:

| Tool | Version |
|------|---------|
| Git | any recent |
| Node.js | **v22.x** |
| npm | **v10.x** |
| Go | **>= 1.24** |
| rsync | (used by build tooling) |

Optional, depending on workflow:

- **kind** + **kubectl** — `npm run dev:kind` (local cluster backend)
- Access to a remote **Flight Control API** — `FLIGHTCTL_SERVER=... npm run dev`

---

## First-time setup

```shell
git clone <your-fork-url>
cd flightctl-ui
npm ci
```

Verify the toolchain:

```shell
node -v    # expect v22.x
npm -v     # expect v10.x
go version # expect go1.24 or newer
```

---

## Development modes (choose one)

| Mode | Command | When to use |
|------|---------|-------------|
| **Offline mock API** | `npm run dev:mock` | No cluster credentials; UI-only work with static JSON |
| **Local Kind backend** | `npm run dev:kind` | Flight Control running in a local kind cluster |
| **Remote backend** | `FLIGHTCTL_SERVER=https://<api-host> npm run dev` | QE lab, shared dev cluster, etc. |
| **OCP console plugin** | `npm run dev:ocp` | Plugin development (requires `oc login`; separate from mock mode) |

Most fork contributors who cannot reach `FLIGHTCTL_SERVER` should use **`npm run dev:mock`**.

---

## Offline UI development (mock proxy)

### What it is

`npm run dev:mock` starts two processes (via `concurrently`):

1. **Webpack dev server** — React UI at **http://localhost:9000**
2. **Go proxy** — API gateway at **http://localhost:3001** with `DEV_MOCK_API=true`

In mock mode the proxy **does not** forward traffic to `FLIGHTCTL_SERVER`. It serves JSON from `proxy/fixtures/` and stubs login routes so the standalone app can boot without OAuth or a cluster.

There is **no web UI on port 3001**—the proxy runs in the background. You only interact with **http://localhost:9000**.

### Quick start

```shell
npm run dev:mock
```

Open **http://localhost:9000** in a browser.

Expected behavior:

- Logged in as **`dev-user`** (configurable via `DEV_MOCK_USER`)
- Organization **`default`** auto-selected (see `proxy/fixtures/flightctl/organizations.list.json`)
- **Fleets**, **Repositories**, and related list pages show fixture data
- Fleets page may show **ResourceSync** import alerts if fixtures include pending/error syncs

Proxy logs should include:

```text
DEV_MOCK_API enabled — not forwarding Flight Control API traffic to FLIGHTCTL_SERVER
DEV_MOCK_API: loading fixtures from fixtures
Proxy running at:3001
```

### Architecture (request flow)

```text
Browser (localhost:9000)
  → fetch http://localhost:3001/api/flightctl/api/v1/...
  → Go proxy (DEV_MOCK_API)
       ├─ /api/login/*     → mock auth (session cookie, dev-user)
       └─ /api/flightctl/* → JSON fixtures under proxy/fixtures/
  → React parses JSON as @flightctl/types models
```

The UI never talks to the real API host in mock mode. Shapes must still match types generated from the [flightctl OpenAPI spec](https://github.com/flightctl/flightctl/tree/main/api/core/v1beta1).

### Environment variables (mock mode)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEV_MOCK_API` | `false` | Set to `true` by `npm run dev:mock` |
| `DEV_MOCK_FIXTURES_DIR` | _(empty → `proxy/fixtures` when cwd is `proxy/`)_ | Override fixture root |
| `DEV_MOCK_USER` | `dev-user` | Username in `/api/login/info` |
| `DEV_MOCK_ORG` | `default` | Documented org id; must match fixture `metadata.name` |
| `API_PORT` | `3001` | Proxy listen port |
| `ENABLE_CLI_ARTIFACTS` | set `false` by `dev:mock` script | Avoids optional CLI proxy routes |

Full list: [CONFIGURATION.md](CONFIGURATION.md).

Manual equivalent:

```shell
DEV_MOCK_API=true ENABLE_CLI_ARTIFACTS=false npm run dev
```

### Troubleshooting

#### `EADDRINUSE` on port 9000 or 3001 / `[nodemon] app crashed`

A previous dev session (or orphaned `go run` / webpack process) is still holding the port. `npm run dev:mock` runs `hack/kill-dev-ports.sh` automatically via `predev:mock`; `dev:proxy` also frees port 3001 before nodemon starts.

If ports are still stuck:

```shell
sh hack/kill-dev-ports.sh
npm run dev:mock
```

Or manually:

```shell
lsof -i :9000
lsof -i :3001
kill <pid>
```

#### Redirect to `/login` or blank app after load

- Confirm the proxy is running (check terminal for `Proxy running at:3001`).
- In DevTools → **Network**, `GET http://localhost:3001/api/login/info` should return **200** with `{"username":"dev-user"}`.
- Clear site data for `localhost:9000` / `localhost:3001` if an old session cookie conflicts.

#### `428 Organization selection required`

The UI sends `X-FlightCtl-Organization-ID` after org selection. Ensure `organizations.list.json` includes an org named **`default`** (or match `DEV_MOCK_ORG`).

#### Page loads but lists are empty / errors

The route may have **no fixture** yet. See [Adding fixtures](#adding-or-updating-fixtures) and check the browser Network tab for `404` responses with `"mock: no fixture for GET ..."`.

#### `npm run dev:mock` vs Cypress

Cypress `cy.intercept` stubs run **only inside Cypress**. Mock proxy mode works in a **normal browser** without running tests. You may reuse the same JSON shapes as Cypress fixtures under `libs/cypress/fixtures/`.

---

## Mock API coverage

### Supported GET routes (built-in fixtures)

| API path | Fixture file |
|----------|----------------|
| `api/v1/organizations` | `flightctl/organizations.list.json` |
| `api/v1/auth/permissions` | `auth/permissions.json` |
| `api/v1/auth/config` | `auth/config.json` |
| `api/v1/auth/userinfo` | `auth/userinfo.json` |
| `api/v1/fleets` | `flightctl/fleets.list.json` |
| `api/v1/repositories` | `flightctl/repositories.list.json` |
| `api/v1/resourcesyncs` | `flightctl/resourcesyncs.list.json` |
| `api/v1/devices` | `flightctl/devices.list.json` |
| `api/v1/enrollmentrequests` | `flightctl/enrollmentrequests.list.json` |
| `api/v1/<resource>/<name>` | Item from matching `*.list.json`, or `flightctl/<resource>.detail.<name>.json` |
| `api/v1/imagebuilds` | `imagebuilder/imagebuilds.list.json` |
| `api/v1/imagepromotions` | `imagebuilder/imagepromotions.list.json` |
| `api/v1/imageexports` | `imagebuilder/imageexports.list.json` |
| `api/v1/imagebuilds/<name>` | Item from `imagebuilds.list.json` or `imagebuilder/imagebuilds.detail.<name>.json` |

Routing logic: `proxy/mock/registry.go` (flightctl) and `proxy/mock/registry_imagebuilder.go` (imagebuilder).

### Not supported in mock mode (HTTP 501)

- `/api/alerts/...`
- `/api/cli-artifacts`
- `/api/terminal/...` (WebSocket)

### Mutations (POST / PUT / PATCH / DELETE)

Phase 1 returns **`{}`** with status **200** so simple flows do not crash. They do **not** persist changes. For interactive create/edit flows, add dedicated fixture handling in `proxy/mock/registry.go` or extend mutation logic in a follow-up change.

---

## Adding or updating fixtures

### 1. Find what the UI calls

In `libs/ui-components` or `apps/standalone`, search for:

- `useFetchPeriodically`
- `endpoint:`
- `` get('...') `` / `` fetch.get<...>('...') ``

Example: `fleets?limit=15` → proxy path `api/v1/fleets` (query string is ignored for file lookup).

### 2. Match TypeScript / OpenAPI shapes

- Types: `libs/types/models/<Resource>.ts`, `<Resource>List.ts`
- Spec: [flightctl OpenAPI](https://github.com/flightctl/flightctl/tree/main/api/core/v1beta1/openapi.yaml)
- Regenerate types after upstream API changes: `npm run gen-types` (do not hand-edit generated files)

List responses must include wrapper fields, for example:

```json
{
  "apiVersion": "v1beta1",
  "kind": "FleetList",
  "metadata": {},
  "items": [ ... ]
}
```

### 3. Edit JSON under `proxy/fixtures/`

```text
proxy/fixtures/
  auth/
    config.json
    permissions.json
    userinfo.json          # preferredUsername for API userinfo
  flightctl/
    organizations.list.json
    fleets.list.json
    fleets.detail.<name>.json   # optional detail override
    ...
```

See [proxy/fixtures/README.md](proxy/fixtures/README.md).

### 4. Restart the proxy

`nodemon` reloads when files under `proxy/` change (including `fixtures/**/*.json`). If the UI still looks stale, restart `npm run dev:mock`.

### 5. Verify

```shell
# Login info
curl -s http://localhost:3001/api/login/info

# List (requires org header, as the UI sends)
curl -s -H "X-FlightCtl-Organization-ID: default" \
  "http://localhost:3001/api/flightctl/api/v1/fleets?limit=15"
```

Run mock router tests:

```shell
cd proxy && go test ./mock/...
```

### ResourceSync alert fixtures

`ResourceSyncImportStatus` shows alerts when `status.conditions` imply pending or error states (see `libs/ui-components/src/utils/status/repository.ts`). Include varied conditions in `resourcesyncs.list.json` when testing fleet import banners.

---

## Working with a real backend (after mock development)

When you gain cluster access:

```shell
FLIGHTCTL_SERVER=https://<flightctl-api-host> npm run dev
```

Use the **Flight Control API** route URL, not the OpenShift Console URL. Discover routes with:

```shell
oc get routes -A | grep -i flight
```

For self-signed certificates, see [CONFIGURATION.md](CONFIGURATION.md) and the README section on `FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY`.

---

## Code quality before submitting changes

From the repository root:

```shell
npm run lint
```

After API or copy changes:

```shell
npm run gen-types   # if flightctl OpenAPI changed
npm run i18n        # if user-visible strings changed (edit source, not translation.json)
```

Go changes in `proxy/`:

```shell
cd proxy && go test ./...
```

---

## Project layout (contributor cheat sheet)

| Path | Purpose |
|------|---------|
| `apps/standalone` | Standalone web app entry |
| `libs/ui-components` | Shared React components and hooks |
| `libs/types` | Generated API types (`npm run gen-types`) |
| `proxy/` | Go API proxy (includes `mock/` and `fixtures/`) |
| `libs/cypress` | E2E tests and example intercept fixtures |

---

## Security note

**Never enable `DEV_MOCK_API` in production.** It bypasses real authentication and serves static data. It is intended for local development only.

---

## Getting help

- Upstream project: [flightctl/flightctl-ui](https://github.com/flightctl/flightctl-ui)
- Backend API: [flightctl/flightctl](https://github.com/flightctl/flightctl)
- Configuration reference: [CONFIGURATION.md](CONFIGURATION.md)
