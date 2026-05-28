# Dev mock API fixtures

Used when `DEV_MOCK_API=true` (see [CONFIGURATION.md](../../CONFIGURATION.md) and [CONTRIBUTING.md](../../CONTRIBUTING.md)).

JSON shapes should match `@flightctl/types` / the [flightctl OpenAPI spec](https://github.com/flightctl/flightctl/tree/main/api/core/v1beta1).

## Layout

- `auth/` — auth config, permissions, userinfo
- `flightctl/` — list responses (`*.list.json`) and optional `*.detail.<name>.json` or `*.detail.<parent>.<name>.json` for nested resources (e.g. `resourcesyncs.detail.rs-pending-fleet.json`)
- `imagebuilder/` — image builds API (`v1alpha1`); list responses and optional detail files

## Adding a fixture

1. Find the API path the UI calls (e.g. `fleets?limit=15` → `api/v1/fleets`).
2. Check `libs/types/models/` for the list/resource types.
3. Add or update the matching `flightctl/<resource>.list.json` file.
4. Restart the proxy (`npm run dev` / `npm run dev:mock`).
