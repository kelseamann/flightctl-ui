# Flight Control UI configuration

This document describes all environment variables and configuration options available for the Flight Control UI.

## Feature toggles

| Variable               | Description                               | Default | Values          |
| ---------------------- | ----------------------------------------- | ------- | --------------- |
| `ENABLE_CLI_ARTIFACTS` | Enable/disable CLI download functionality | `true`  | `true`, `false` |
| `ENABLE_ALERTMANAGER`  | Enable/disable alerts functionality       | `true`  | `true`, `false` |

## Backend configuration

| Variable                                | Description                                                                                         | Default                  | Values                                       |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------- |
| `BASE_UI_URL`                           | Base URL for UI application                                                                         | `http://localhost:9000`  | `https://ui.flightctl.example.com`           |
| `FLIGHTCTL_SERVER`                      | Flight Control API server URL                                                                       | `https://localhost:3443` | `https://api.flightctl.example.com`          |
| `FLIGHTCTL_SERVER_INSECURE_SKIP_VERIFY` | Skip backend server TLS verification                                                                | `false`                  | `true`, `false`                              |
| `FLIGHTCTL_CLI_ARTIFACTS_SERVER`        | CLI artifacts server URL                                                                            | `http://localhost:8090`  | `https://cli.flightctl.example.com`          |
| `FLIGHTCTL_ALERTMANAGER_PROXY`          | AlertManager proxy server URL                                                                       | `https://localhost:8443` | `https://alerts.flightctl.example.com`       |
| `FLIGHTCTL_IMAGEBUILDER_SERVER`         | ImageBuilder API server URL                                                                         | `https://localhost:8445` | `https://imagebuilder.flightctl.example.com` |
| `AUTH_INSECURE_SKIP_VERIFY`             | Skip auth server TLS verification                                                                   | `false`                  | `true`, `false`                              |
| `TRUST_X_FORWARDED_HEADERS`             | Trust `X-Forwarded-Proto`/`X-Forwarded-Host` for request origin checks (enable behind trusted LB) | `false`                  | `true`, `false`                              |
| `TRUSTED_PROXY_CIDRS`                   | Comma-separated trusted proxy CIDRs for forwarded-header trust; when set but invalid, trust fails closed | _(empty)_           | `10.0.0.0/8,192.168.0.0/16`                  |
| `TLS_CERT`                              | Path to TLS certificate                                                                             | _(empty)_                | `/path/to/server.crt`                        |
| `TLS_KEY`                               | Path to TLS private key                                                                             | _(empty)_                | `/path/to/server.key`                        |
| `API_PORT`                              | UI proxy server port                                                                                | `3001`                   | `8080`, `3000`, etc.                         |
| `IS_OCP_PLUGIN`                         | Run as OpenShift Console plugin                                                                     | `false`                  | `true`, `false`                              |
| `IS_RHEM`                               | Red Hat Enterprise Mode                                                                             | _(empty)_                | `true`, `false`                              |
| `DEV_MOCK_API`                          | Serve static JSON fixtures from the Go proxy instead of forwarding to `FLIGHTCTL_SERVER` (dev only) | `false`                  | `true`, `false`                              |
| `DEV_MOCK_FIXTURES_DIR`                 | Directory containing mock JSON fixtures (default: `proxy/fixtures` when the proxy runs from `proxy/`) | _(empty)_             | absolute or relative path                      |
| `DEV_MOCK_USER`                         | Username returned by `/api/login/info` in mock mode                                                  | `Kelsea Mann UXD`        | any string                                   |
| `DEV_MOCK_ORG`                          | Organization name in mock fixtures (must match `organizations.list.json`)                            | `default`                | any string                                   |

## Offline UI development (mock API)

Run the standalone UI without a Flight Control cluster:

```shell
npm run dev:mock
```

Then open `http://localhost:9000`. The Go proxy on port `3001` serves JSON from `proxy/fixtures/` and does not call `FLIGHTCTL_SERVER`. See [CONTRIBUTING.md](CONTRIBUTING.md) for a full contributor guide (troubleshooting, fixture authoring, coverage).

Limitations in mock mode:

- Alerts, CLI artifacts, and device terminal return HTTP 501.
- Image builder serves list/detail fixtures for `imagebuilds`, `imagepromotions`, and `imageexports`; other imagebuilder routes may return 404 or `{}` for mutations.
- Software catalog serves `catalogs` and `catalogitems` list/detail fixtures under the flightctl API path (`v1alpha1` shapes in `proxy/fixtures/flightctl/`).
- Only GET list/detail routes with fixtures are fully supported; other mutations return `{}`.
- Extend fixtures under `proxy/fixtures/` using shapes from `@flightctl/types` (see `proxy/fixtures/README.md`).

## Configuration examples

```shell
# Use auto-detection of all configuration settings
npm run dev:kind
```

```shell
# Use auto-detection and override desired settings
ENABLE_CLI_ARTIFACTS=false npm run dev:kind
```

```shell
# Use remote backend and custom settings
FLIGHTCTL_SERVER=https://flightctl.prod.example.com \
ENABLE_CLI_ARTIFACTS=false \
npm run dev
```

```shell
# Offline UI development with static API fixtures
npm run dev:mock
```
