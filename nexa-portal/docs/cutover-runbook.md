# Cutover runbook

The rebuild is only finished when it provably issues the same network traffic as the legacy app.
This document is the procedure for establishing that, and the go/no-go gate for flipping the
published image.

Everything below is a verification step. **None of it modifies the backend.** No file in
`nexa-beeper-connector-main` is touched: not the FastAPI sidecar, not `ai/`, not the executor loop,
not the Matrix/mautrix bridge wiring, not the SQLite schema, not `docker-compose.yaml`.

## What has already been verified automatically

These run in CI on every push and do not need repeating by hand.

| Check                        | Command               | What it proves                                                    |
| ---------------------------- | --------------------- | ----------------------------------------------------------------- |
| App typecheck                | `pnpm typecheck`      | Strict TypeScript across apps and libs                            |
| Core is platform-neutral     | `pnpm typecheck:core` | `libs/core` compiles with `lib: ["ES2022"]` and `types: []`       |
| Boundaries                   | `pnpm lint`           | Nx tags, no DOM globals in core, no banned imports                |
| Parity options               | `pnpm test:core`      | Poll cadences, seeded initial data, no-retry, no refetch-on-focus |
| Request sequences per screen | `pnpm test:web`       | Exact method and path of every request each screen makes          |
| Flows in a real browser      | `pnpm test:e2e`       | Router guards, cookie session, provider chain, drawer nav         |

The request-sequence assertions are the automated half of the parity diff. `startRequestLog` in
`apps/nexa-portal/src/testing/request-log.ts` records everything MSW intercepts, and the tests
assert the full array rather than a subset, so an accidental extra fetch fails the build. MSW is
configured with `onUnhandledRequest: 'error'`, so calling an endpoint the contract does not list
also fails.

## The manual side-by-side diff

The automated tests run against MSW. This step runs both UIs against the real sidecar, which is the
only way to catch a difference the mocks encode identically in both directions.

### Setup

1. Start the sidecar exactly as it runs today. Do not change its configuration.
2. Serve the legacy app on one port and the rebuild on another, both pointed at that sidecar:
   - legacy: `Nexa-FrontEnd-main`, `npm run dev`
   - rebuild: `nexa-portal`, `pnpm dev` (proxies `/api` to `http://localhost:8080`)
3. Open both in separate browser profiles with DevTools → Network, filtered to `/api`, with
   "Preserve log" on.

### Per screen

For each screen, perform the same actions in both, then compare the request lists on **method,
path, query string, and request body** — not on timing or response content.

| Screen    | Actions to perform                               | Expected requests                                                                                                                        |
| --------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Bootstrap | Cold load with no session                        | `GET /api/auth/me` exactly once                                                                                                          |
| Login     | Submit with a wrong password, then a correct one | `POST /api/auth/login` once per submit, nothing else                                                                                     |
| Register  | Submit with the phone field left blank           | `POST /api/auth/register` with a body of `name`, `email`, `password` and **no `phone` key**                                              |
| OAuth     | Click Google                                     | A full-page navigation to `/api/auth/oauth/google/start`, not an XHR                                                                     |
| Dashboard | Load, then navigate away and back                | `GET /api/stats` and `GET /api/messages/recent?limit=10` on each visit, in that order                                                    |
| Onboard   | Click Start, wait 60s, watch the clock           | `POST /api/onboard/whatsapp/start`, then `/status/{id}` at 3s intervals and `/qr/{id}` at 18s intervals, with **nothing at t=0**         |
| Onboard   | Let the session connect                          | `DELETE /api/onboard/whatsapp/session/{id}` once, and both polls stop                                                                    |
| Onboard   | Click Start, then Cancel                         | `DELETE .../session/{id}` once                                                                                                           |
| Onboard   | Click Start, then navigate to Dashboard mid-scan | **No `DELETE`.** The session is left open on the sidecar. This is the current behaviour (DP-010), not a bug to fix during the migration. |
| Bridges   | Load                                             | `GET /api/bridge/whatsapp/status` and `GET /api/bridge/linkedin/status`, and **no Instagram or Twitter requests**                        |
| Bridges   | Click Disconnect on a connected bridge           | `POST /api/bridge/whatsapp/logout` once, with **no follow-up status request**                                                            |
| Sign out  | Click Sign out                                   | `POST /api/auth/logout` once                                                                                                             |

### Known and accepted differences

Only these may appear in the diff. Anything else is a defect.

- **Request order within a pair may vary by milliseconds.** The Dashboard fires its two requests
  concurrently in both versions; `Promise.all` and `useQueries` do not guarantee ordering.
- **`GET /api/auth/me` may be absent on a warm reload of the rebuild** only if a session probe
  already resolved in that page load. `rehydrateSession` is guarded to run at most once per page
  load, matching the legacy `useEffect` with a `[]` dependency; a fresh page load always probes.

There are no accepted differences in URLs, methods, bodies, counts, or cadences.

## Behaviour checks the network tab cannot show

Run through `docs/screen-inventory.md` and confirm each item in its 18-point acceptance checklist.
The ones most worth doing by hand, because they are the ones a refactor tends to quietly improve:

- The Dashboard renders zeroed KPI cards and "No messages yet." when both requests fail. It does
  **not** show an error.
- A failed onboarding poll leaves the screen on the QR with no error, and polling continues.
- Disconnect fires on the first click. There is no confirmation dialog (DP-003).
- LinkedIn's Connect button is disabled. The legacy button linked to `/onboard-linkedin`, which was
  never a mounted route and rendered a blank screen (DP-001).
- A one-character password is accepted at sign-in. No strength or length rule was added (DP-011).
- Error copy matches exactly: `Session expired — please try again.`, `Could not reach bridge`,
  `Disconnected successfully.`, `Logout failed`, `Something went wrong`, `Failed to start onboarding`.

## Go / no-go

Ship only when all of the following hold:

- [ ] CI is green on `main`.
- [ ] The per-screen network diff shows no difference outside the accepted list above.
- [ ] The 18-point checklist in `docs/screen-inventory.md` passes.
- [ ] The image builds and serves: `docker build -t nexa-frontend:rebuild .` then run it behind the
      same nginx config and repeat the Bootstrap and Dashboard rows against a real sidecar.

## Flipping the image

`.github/workflows/docker-publish.yml` already publishes to
`ghcr.io/codzofrosh/nexa-frontend:latest` — the same image and tag the legacy workflow used. Nothing
in the deployment needs to change; whatever pulls that tag picks up the rebuild.

Recommended sequence:

1. Retag the current published image as a rollback point:
   `docker pull ghcr.io/codzofrosh/nexa-frontend:latest`, then push it as `:pre-rebuild`.
2. Disable the legacy repository's `docker-publish.yml` workflow, so the two do not race for the
   same tag.
3. Merge to `main` and let this repository publish.
4. Re-run the Bootstrap, Dashboard, and Bridges rows against production.

Rollback is `docker pull ghcr.io/codzofrosh/nexa-frontend:pre-rebuild` and a retag, since no
backend, database, or API change is involved in either direction.

## Retiring the legacy source

Do this only after the rebuild has served production traffic without incident.

`Nexa-FrontEnd-main` has not been modified during the migration and remains the reference for every
parity claim in `docs/`. Keep it read-only in place rather than deleting it until the runbook above
has been signed off in production, then archive the repository rather than removing the directory.

The `mobile/` directory in the legacy repository is a separate matter: it expects a `token` field in
the auth response that the sidecar does not return, so it cannot have worked. See DP-009 and
`docs/mobile-readiness.md` before reviving it.
