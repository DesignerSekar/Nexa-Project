# Mobile parity checklist (Phase 8)

Adapted from web `docs/screen-inventory.md` Phase 9. Tick against a real Android emulator + sidecar.

## A. Bootstrap / session

- [ ] Cold start with stored token calls `GET /api/auth/me` once with Bearer
- [ ] Cold start without token lands on Auth (no crash)
- [ ] Mid-session 401 clears token, shows snackbar, lands on Auth

## B. Auth

- [ ] Sign in persists token and opens Main tabs
- [ ] Create account omits blank phone; same success path
- [ ] Tab switch clears inline error
- [ ] Empty required fields show client validation; no request
- [ ] Google / GitHub buttons disabled or “use web” (no invented OAuth API)

## C. Shell

- [ ] Bottom tabs: Dashboard / WhatsApp / Bridges / Profile
- [ ] Theme toggle persists light/dark
- [ ] Profile shows name/email/phone from store
- [ ] Sign out confirms → `POST /api/auth/logout` → clear token → Auth (API errors still clear local)

## D. Dashboard

- [ ] Parallel `GET /api/stats` + `GET /api/messages/recent?limit=10`
- [ ] Refresh re-fetches both
- [ ] KPI tap filters recent list client-side and scrolls to list
- [ ] Priority + classifier breakdowns render from stats payload
- [ ] Recent messages FlatList display-only

## E. Onboard WhatsApp

- [ ] Start → `POST /api/onboard/whatsapp/start` with `user_id` or `default`
- [ ] Status poll every 3000 ms; nothing at t=0
- [ ] QR refresh every 18000 ms
- [ ] Connected → `DELETE .../session/{id}` + success UI + snackbar
- [ ] Cancel → DELETE + idle
- [ ] Navigate away mid-scan → **no** DELETE
- [ ] Connect another → idle, QR cleared, session id retained
- [ ] Try again → idle from error

## F. Bridges

- [ ] Two cards only (WhatsApp, LinkedIn); status GETs on mount
- [ ] Connect WhatsApp → WhatsApp tab
- [ ] Connect LinkedIn disabled (DP-001)
- [ ] Disconnect → POST logout, no confirm, local `logged_out`, no status refetch
