# Nexa Portal

The Nexa web UI, rebuilt on the CRM/e-com v2 architecture: React 19, Ant Design 6, TanStack Router
and Query, Zustand, React Hook Form with Zod, in a pnpm + Nx workspace.

## The one rule that matters

**This is a UI-layer migration. The existing business layer and functions are not touched.**

The backend (`nexa-beeper-connector-main`) is frozen. The portal calls exactly the endpoints the
legacy SPA called, with the same bodies, the same order, and the same cadence. Improvements —
including obvious bug fixes — go in [`docs/deferred-proposals.md`](docs/deferred-proposals.md)
rather than into the code.

Read [`.cursor/rules/nexa.md`](.cursor/rules/nexa.md) before contributing.

## Documentation map

| Document                                                             | Read it when                                                                                           |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [`docs/handover.md`](docs/handover.md)                               | First-day orientation: architecture, features, run/test, git status, recent UI track                   |
| [`docs/api-contract.md`](docs/api-contract.md)                       | You need to know what the backend exposes and what the UI is allowed to call                           |
| [`docs/screen-inventory.md`](docs/screen-inventory.md)               | You are porting or reviewing a screen. This is the parity baseline and the Phase 9 acceptance criteria |
| [`docs/access-control-analysis.md`](docs/access-control-analysis.md) | You are touching auth, guards, or wondering where RLS went                                             |
| [`docs/deferred-proposals.md`](docs/deferred-proposals.md)           | You spotted an improvement, or you want to know why something is still broken                          |
| [`docs/mobile-readiness.md`](docs/mobile-readiness.md)               | You are adding to `libs/core`, or starting the React Native app                                        |
| [`docs/cutover-runbook.md`](docs/cutover-runbook.md)                 | You are signing off parity and flipping the published image                                            |

## Layout

```
apps/nexa-portal      the web app: routing, layout shell, feature slices
apps/nexa-mobile      Expo RN client (same sidecar APIs; Bearer after DP-009)
libs/core/*           platform-neutral. React Native reuses this verbatim
libs/web/*            web-only: axios, Ant Design theme, the design system
```

The core/web split is the one deliberate divergence from ecom-v2's flat `libs/` layout. ecom-v2 is
web-only; Nexa has a mobile app planned, so anything that cannot run under Metro is quarantined in
`libs/web`. The boundary is enforced by Nx tags, by an ESLint ban on DOM globals inside
`libs/core/**`, and by running core tests in a `node` environment.

| Package              | Contents                                                              |
| -------------------- | --------------------------------------------------------------------- |
| `@nexa/contract`     | Endpoint paths and request/response types                             |
| `@nexa/data`         | `HttpClient` port, api/keys/queries per domain, query client          |
| `@nexa/auth`         | Session store, `AuthStrategy` and `KeyValueStore` ports, permissions  |
| `@nexa/schemas`      | Zod schemas shared by both clients                                    |
| `@nexa/tokens`       | Palettes, spacing, typography as plain objects                        |
| `@nexa/util`         | Formatters                                                            |
| `@nexa/platform-web` | axios `HttpClient`, `CookieAuthStrategy`, `localStorage` adapter, env |
| `@nexa/theme-web`    | `buildAntdTheme` over the core tokens                                 |
| `@nexa/shared-ui`    | `App*` primitives, `Form*` fields, providers, hooks                   |

Ports are bound once per app: `apps/nexa-portal/src/app/composition-root.ts` (web) and
`apps/nexa-mobile/src/app/composition-root.ts` (mobile). Feature code never imports a platform
module directly. Mobile runbook: [`apps/nexa-mobile/README.md`](apps/nexa-mobile/README.md).

## Getting started

```bash
pnpm install

# against the real sidecar — the default
pnpm dev

# MSW instead, no sidecar needed
pnpm dev --mode mock
```

The dev server runs on port 3000 and proxies `/api` and `/health` to the sidecar, so the browser
sees every request as same-origin. That is not incidental: the session is an HttpOnly cookie, and
pointing the client at the sidecar's own origin would drag in CORS and `SameSite` for no gain. It
also mirrors production, where nginx proxies `/api`.

The proxy target comes from `NEXA_SIDECAR_URL` and defaults to `http://localhost:8080`, which is
the port `docker-compose` publishes. **Running the sidecar directly with `python sidecar/main.py`
binds 8000 instead**, so that case needs an override in `apps/nexa-portal/.env.local`:

```
NEXA_SIDECAR_URL=http://localhost:8000
```

If sign-in returns a network error, this mismatch is the first thing to check.

### If `pnpm` is not on your PATH

`corepack enable pnpm` needs an elevated shell on Windows because it writes shims into
`C:\Program Files\nodejs`. Either run it as Administrator once, or `npm install -g pnpm@10.28.1`.
Until then the root scripts fail, because they delegate through a nested `pnpm --filter`. Bypass
them with:

```bash
cd apps/nexa-portal && pnpm exec vite
```

## Scripts

| Command                | What it does                                                  |
| ---------------------- | ------------------------------------------------------------- |
| `pnpm dev`             | Dev server on :3000, against the real sidecar                 |
| `pnpm dev --mode mock` | Dev server on :3000, against MSW                              |
| `pnpm build`           | Production build                                              |
| `pnpm typecheck`       | Typecheck the app                                             |
| `pnpm typecheck:core`  | Typecheck `libs/core` with `lib: ["ES2022"]` and no DOM types |
| `pnpm lint`            | ESLint, including module boundaries and the core DOM ban      |
| `pnpm test`            | All Vitest projects                                           |
| `pnpm test:core`       | Core only, node environment, no jsdom                         |
| `pnpm test:e2e`        | Playwright against the mock build                             |
| `pnpm storybook`       | Storybook for `@nexa/shared-ui`                               |

`pnpm typecheck:core` and `pnpm test:core` are the two commands that keep the mobile boundary
honest. If either starts needing DOM types, the boundary has been breached.

`pnpm lint` runs `nx show projects` first. That is not cosmetic: without a cached project graph the
`@nx/enforce-module-boundaries` rule silently skips instead of failing.

## Environment

| Variable           | Default                 | Purpose                                                                   |
| ------------------ | ----------------------- | ------------------------------------------------------------------------- |
| `VITE_API_URL`     | `''`                    | Empty means same-origin, which is what dev and production both use        |
| `VITE_API_MODE`    | `real` in dev           | `mock` starts MSW; `real` talks to the sidecar                            |
| `VITE_APP_TITLE`   | `Nexa`                  | Document title                                                            |
| `NEXA_SIDECAR_URL` | `http://localhost:8080` | Dev-proxy target only. Not a `VITE_` var, so it never reaches the browser |

The committed `.env.development`, `.env.mock`, and `.env.production` cover the normal cases. Put
overrides in `apps/nexa-portal/.env.local`, which is gitignored. Nothing in a `VITE_` variable can
be secret — Vite inlines them into the client bundle.

`VITE_API_MODE` must be a literal `mock` for MSW to start. `main.tsx` reads
`import.meta.env.VITE_API_MODE` directly rather than the Zod-validated `env` object, so that Vite
can inline it and Rollup can drop MSW from real builds. The trade-off is that the schema's default
does not apply to that one check — which is why `.env.development` sets the mode explicitly.

## Deployment

Unchanged from the legacy app. The multi-stage `Dockerfile` builds with pnpm and serves the static
output from nginx; `nginx.conf` is byte-identical to the legacy one, still proxying `/api/` to
`http://backend:8080/api/`. CI publishes to the same `ghcr.io/codzofrosh/nexa-frontend:latest` tag,
so `docker-compose.yaml` in the connector repo needs no edit.
