# Deferred Proposals

The parking lot that keeps the migration honest.

The governing constraint on this work is that the **existing business layer and functions are not
touched**. Every improvement spotted while porting lands here instead of in the code — including
obvious bug fixes, because a bug fix shipped inside a restyle is indistinguishable from a
regression when the network logs are diffed in Phase 9.

Each entry records the observed current behaviour, the proposed change, why it was excluded, and
roughly what it would take.

---

## DP-001 — The LinkedIn Connect button goes nowhere

**Observed.** `src/pages/Bridges.tsx` mounts the LinkedIn card with
`connectPath="/onboard-linkedin"`. No such route exists in `src/App.tsx`. Clicking Connect performs
a full-page navigation to a path that hits the router's catch-all and redirects to `/`, landing the
user on the Dashboard with no explanation.

**Proposed.** Build a LinkedIn onboarding screen. The sidecar already exposes the generic
`POST /api/bridge/{platform}/login` and `GET /api/bridge/{platform}/qr`, so the flow could mirror
the WhatsApp screen.

**Why excluded.** Those two endpoints have **never been called by the web client**. Building the
screen would introduce new backend traffic, which is exactly what the constraint forbids. The
rebuild reproduces the dead link.

**Effort.** One feature slice, roughly the size of the existing Onboard screen, plus verification
that `mautrix-linkedin` returns a QR in the same data-URL shape. Needs a decision on whether
LinkedIn onboarding is QR-based at all — it may be credential-based, in which case the flow differs
materially from WhatsApp.

---

## DP-002 — Instagram and Twitter bridge cards

**Observed.** The Bridges screen mounts two cards, `whatsapp` and `linkedin`.

**Proposed.** Mount `instagram` and `twitter` too. Both are fully wired on the backend:
`sidecar/main.py` maps bridge bots for all four platforms, `docker-compose.yaml` runs
`mautrix-instagram` and `mautrix-twitter`, and `GET /api/bridge/{platform}/status` accepts all four.

**Why excluded.** Two more cards means two more status requests on page load. New traffic.

**Effort.** Two lines. This is the cheapest item on the list and the most likely to be wanted first.

---

## DP-003 — Confirmation before disconnecting a bridge

**Observed.** The Disconnect button calls `POST /api/bridge/{platform}/logout` immediately on
click. Disconnecting a bridge unlinks a messaging account and stops message ingestion for that
platform.

**Proposed.** Gate it behind `useConfirm()` from `@nexa/shared-ui`, which is the ecom-v2 house
pattern for destructive actions.

**Why excluded.** It inserts a step into an existing flow. A user who clicks Disconnect today is
disconnected; after the change they are not, until they confirm. That is a behavioural change even
though it is plainly an improvement.

**Effort.** A few lines. The hook is already ported and available.

---

## DP-004 — `classifier_breakdown` is fetched and discarded

**Observed.** `GET /api/stats` returns `classifier_breakdown: Record<string, number>` alongside
`priority_breakdown`. The Dashboard renders `priority_breakdown` as a card list and renders
`classifier_breakdown` **nowhere**. The data crosses the wire on every dashboard load and is thrown
away.

**Proposed.** Render it, most naturally beside the priority breakdown.

**Why excluded.** Displaying a field no screen currently displays is a new feature, not a restyle.

**Effort.** Small. Note the knock-on: this proposal and DP-009 together are the only reasons to add
a charting library, so they should be scheduled together if charts are wanted.

---

## DP-005 — No timestamp column on recent messages

**Observed.** `Message.timestamp` is an epoch number returned by
`GET /api/messages/recent`. The recent-messages table shows Sender, Content, Platform, and
Classification — no timestamp. `Message.confidence` is likewise returned and never shown.

**Proposed.** Add a relative or absolute timestamp column, and optionally a confidence indicator on
the classification.

**Why excluded.** New columns, new information density, and a change to the table's shape.

**Effort.** Small. `@nexa/util` already has the date formatters, and the `FormattedDate` treatment
is a solved problem in the design system.

---

## DP-006 — Per-section loading states on the Dashboard

**Observed.** While the two dashboard requests are in flight, the entire screen renders the single
string `Loading…`. The page header and card structure are not mounted.

**Proposed.** Adopt ecom-v2's house rule: keep the header and card structure mounted and interactive
and show a centered spinner-only overlay per section, so the layout does not jump.

**Why excluded.** It changes what the user sees during load and the DOM mounted at each moment.
Strictly a visual improvement, but the rebuild is holding a hard line, and this one is easy to
misjudge as "just styling" when it actually restructures the render.

**Effort.** Small, and worth doing early once parity is signed off. This is the single biggest
perceived-quality gap between the rebuild and ecom-v2's conventions.

---

## DP-007 — AG Grid `DataView` for the recent-messages table

**Observed.** The recent-messages table is a plain read-only `<table>`: four columns, no sorting, no
filtering, no pagination, no row actions, no row click.

**Proposed.** Replace it with ecom-v2's `DataView` / `ListView` / `AgGridHost` chain, which brings
column sorting, floating filters, pagination, saved view profiles, and an actions column pinned
first.

**Why excluded.** Every one of those affordances is new interactive behaviour. An actions column in
particular would require inventing a row action — most likely a message detail drawer — that has no
endpoint behind it and no precedent in the current UI. The rebuild uses a read-only Ant Design
`Table` with `pagination={false}`.

**Consequence.** `ag-grid-community`, `ag-grid-enterprise`, and `ag-grid-react` are **not** in the
dependency set, and the AG Grid Enterprise licence question does not arise. Adopting this proposal
means taking on that licence.

**Effort.** Moderate, and it is the right call once the table needs to grow past ten rows. Note that
`GET /api/messages/recent` only accepts `limit`, so server-side pagination would need a backend
change first.

---

## DP-008 — Unauthenticated, unscoped reads on stats and messages

**Observed.** `GET /api/stats` and `GET /api/messages/recent` require no session and apply no
`user_id` filter. Any unauthenticated caller who can reach the sidecar reads every user's message
content, senders, and platforms.

**Proposed.** In order: add the existing session dependency to every `/api/*` read; add a `user_id`
column to `messages` and `actions` populated at ingestion and filter by the session user; consider
Postgres with real RLS policies only if Nexa becomes multi-tenant.

**Why excluded.** Backend change, squarely in the frozen business layer.

**Priority.** This is the only entry on this list that is a **security** issue rather than a
usability one, and it should be scheduled independently of any UI work. Full write-up in
`access-control-analysis.md`.

---

## DP-009 — Token issuance for the mobile client

**Status. Done** (session transport only). Login/register JSON includes `token` (existing
`auth_sessions` PK). `/api/auth/me` and `/api/auth/logout` accept `Authorization: Bearer` alongside
the cookie. Web cookie behaviour unchanged. Consumed by `apps/nexa-mobile` `TokenAuthStrategy`.
See `docs/mobile-readiness.md`.

---

## DP-010 — Stale sidebar active state

**Observed.** `src/App.tsx` computes `const path = window.location.pathname` once during render and
passes it to each `NavLink` as `current`. Because client-side navigation does not re-run that read,
the highlighted sidebar item can disagree with the visible page.

**Status.** **Already resolved incidentally** by the rebuild, and listed here only so the Phase 9
diff is not surprising. TanStack Router supplies live active state, so the rebuilt sidebar
highlights correctly. This is an internal render detail with no request, data, or user-flow impact,
which is why it was not held back for parity.

---

## DP-011 — Register form validation depth

**Observed.** Validation is browser-native only: `required` on Name, Email, and Password, and
`type="email"` on Email. There is no minimum password length, no password strength rule, no phone
format check, and no server error field mapping.

**Proposed.** Real validation rules in the Zod schemas — password minimum length, phone parsing via
`libphonenumber-js`, and mapping the sidecar's `detail` string onto the offending field.

**Why excluded.** Any added rule rejects input the current form accepts, which changes behaviour.
`RegisterSchema` in `@nexa/schemas` therefore encodes **only** the existing rules.

**Effort.** Small, but needs a product decision on the password policy, and ideally a matching
change on the sidecar so the two agree.
