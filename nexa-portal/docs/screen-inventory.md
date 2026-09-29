# Screen Inventory — Parity Baseline

Written **before** any rebuild code, by reading the four existing pages, so the migration has a
fixed target rather than a remembered one. This document is the **acceptance criteria for Phase 9**.

Source files:

- `Nexa-FrontEnd-main/src/App.tsx` — shell, auth gate, routing
- `Nexa-FrontEnd-main/src/pages/Login.tsx`
- `Nexa-FrontEnd-main/src/pages/Dashboard.tsx`
- `Nexa-FrontEnd-main/src/pages/Onboard.tsx`
- `Nexa-FrontEnd-main/src/pages/Bridges.tsx`

## How to read this

Each screen records what must stay identical (fields, flows, strings, request sequences, cadences)
and what is expected to change (visual treatment only). The right-hand column of each mapping table
names the Ant Design 6 or `@nexa/shared-ui` component that replaces the hand-rolled markup.

A restyle is in scope. A change in **what data is shown, what requests fire, in what order, at what
interval, or what text the user reads on error** is out of scope.

---

## Shell (`App.tsx`)

### Bootstrap sequence

1. Mount with `user = null`, `loading = true`.
2. Call `GET /api/auth/me`.
3. On `{ authenticated: true, user }` set the user. On anything else, including a thrown error,
   leave it null — the `.catch(() => {})` is silent.
4. `finally` set `loading = false`.

While `loading` is true the whole app renders the single string `Loading…` and nothing else. No
sidebar, no layout.

### Auth gate

- `user === null` → only `/login` renders; every other path redirects to `/login`.
- `user !== null` → sidebar shell renders; every unknown path redirects to `/`.

### Sidebar

| Item         | Target     | Note                               |
| ------------ | ---------- | ---------------------------------- |
| Brand `Nexa` | —          | Static text, not a link            |
| Subtitle     | —          | `user.name`                        |
| `Dashboard`  | `/`        |                                    |
| `WhatsApp`   | `/onboard` | Label is "WhatsApp", not "Onboard" |
| `Bridges`    | `/bridges` |                                    |
| `Sign out`   | —          | Pinned to the bottom, red text     |

Active-item detection reads `window.location.pathname` once at render time and is therefore stale
after client-side navigation. The rebuild uses the router's own active state, which is correct
rather than stale. This is an internal correctness detail with no request or data impact.

### Sign-out sequence

1. `POST /api/auth/logout`, errors swallowed via `.catch(() => {})`.
2. Set user to null.
3. Navigate to `/login`.

### Mapping

| Current                             | Replacement                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------- |
| `<div style={S.layout}>` flex shell | `AuthenticatedLayout` — 80px icon rail, overlay expand, fixed `marginLeft: 80`      |
| `NavLink` buttons                   | Ant Design `Menu` inside the rail, Lucide icons via `AppIcon variant="nav"`         |
| Bare `Loading…` string              | Centered spinner-only `Spin` in `module-loading-center`, `aria-label="Loading"`     |
| No header                           | `AuthenticatedLayoutHeader` with theme toggle, language select, user menu, sign-out |

The header is new chrome, not new behaviour: the theme toggle and language select are client-only
preferences that issue no requests.

---

## Login (`Login.tsx`)

Route today: `/login`. Route in the rebuild: `/login`, plus `/register` as a deep link to the same
screen with the Create-account tab preselected.

### Local state

`tab` (`'login' | 'register'`, default `'login'`), `name`, `email`, `phone`, `password`, `error`,
`loading`.

### Fields

| Field         | Tab           | Type       | Required                                    | Placeholder       |
| ------------- | ------------- | ---------- | ------------------------------------------- | ----------------- |
| Name          | register only | text       | **yes** (`required`)                        | `Jane Doe`        |
| Mobile number | register only | `tel`      | no — label reads `Mobile number (optional)` | `+1 555 000 0000` |
| Email         | both          | `email`    | **yes** (`required`)                        | `you@example.com` |
| Password      | both          | `password` | **yes** (`required`)                        | `••••••••`        |

Validation today is browser-native only: `required` and `type="email"`. There is no length rule, no
pattern, no phone-format check, and no client-side password policy.

### Strings

| Element                    | Exact text                                   |
| -------------------------- | -------------------------------------------- |
| Title                      | `Nexa`                                       |
| Subtitle                   | `AI message routing for WhatsApp & LinkedIn` |
| Tab 1                      | `Sign in`                                    |
| Tab 2                      | `Create account`                             |
| Divider                    | `or`                                         |
| OAuth buttons              | `Google`, `GitHub`                           |
| Submit, idle, login tab    | `Sign in`                                    |
| Submit, idle, register tab | `Create account`                             |
| Submit, in flight          | `Please wait…`                               |
| Error fallback             | `Something went wrong`                       |

Switching tabs clears `error` but **keeps all field values**.

### Submit sequence

1. `preventDefault`, clear `error`, set `loading = true`.
2. Login tab → `POST /api/auth/login` with `{ email, password }`.
   Register tab → `POST /api/auth/register` with `{ name, email, password, phone: phone || undefined }`.
3. On `res.success && res.user` → hand the user up to the shell.
4. On throw → `error` = `err.message`, or `Something went wrong` if not an `Error`.
5. `finally` → `loading = false`.

There is **no navigation on success**. The shell re-renders with a user, and because `/login` is not
one of the authenticated routes, the catch-all sends the browser to `/`, landing on the Dashboard.
The rebuild navigates explicitly to `/app/dashboard`, which produces the same destination.

Note the success condition is `res.success && res.user`. A `200` response with `success: false`
leaves the user on the form with **no error message shown**. This is preserved.

### Mapping

| Current                 | Replacement                                                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `S.box` card            | Ant Design `Card`                                                                                                                                                                                   |
| Hand-rolled tab buttons | `AppTabs`                                                                                                                                                                                           |
| `<input>` + `<label>`   | `FormInput size="large"` with `form-field-label`                                                                                                                                                    |
| `type="tel"` input      | `FormInput` — plain text input, **not** a phone-formatting widget, since no formatting exists today                                                                                                 |
| Inline error `<div>`    | `<Text type="danger" className="form-field-error">`                                                                                                                                                 |
| Native `required`       | `LoginSchema` / `RegisterSchema` in `@nexa/schemas`, encoding **only** the existing rules: name non-empty, email non-empty and email-shaped, password non-empty, phone optional with no format rule |
| Inline SVG brand marks  | Kept as inline SVG — Lucide has no brand glyphs and swapping them would change the visual                                                                                                           |

`useToast` is **not** used for submit failures; the error stays inline in the same position, as
today.

---

## Dashboard (`Dashboard.tsx`)

Route today: `/`. Route in the rebuild: `/app/dashboard`, with `/` redirecting there when
authenticated.

### Load sequence

```ts
Promise.all([api.stats(), api.recentMessages(10)])
  .then(([s, m]) => {
    setStats(s);
    setMessages(m.messages);
  })
  .catch(() => {})
  .finally(() => setLoading(false));
```

Both requests fire **in parallel on mount**, exactly once. `limit=10`. Errors are swallowed
silently: a failure leaves `stats` null and `messages` empty, and the screen renders its zero state
with **no error message at all**.

While loading, the entire screen is replaced by the string `Loading…`. There are no per-section
spinners and no skeletons — the page header is _not_ mounted during load.

> Parity note: ecom-v2's house rule is per-section spinner overlays with the header and card
> structure staying mounted. That is a behavioural change here, so it is **not** adopted. The
> rebuild keeps a single page-level loading gate. Logged as DP-006.

### KPI cards

| Card              | Value                   | Zero fallback |
| ----------------- | ----------------------- | ------------- |
| `Total messages`  | `stats.total_messages`  | `0`           |
| `Pending actions` | `stats.pending_actions` | `0`           |
| `AI classifier`   | `stats.classifier`      | `—`           |

Three cards, in this order. Rendered in an auto-fit grid with a 160px minimum column.

### Priority breakdown

Rendered **only** when `stats` is present and `Object.keys(stats.priority_breakdown).length > 0`.
Section heading `Priority breakdown`. One small card per entry showing the count above the key name.

This is a flat card list, **not a chart**. It stays a card list.

> `stats.classifier_breakdown` is fetched and never rendered. It stays unrendered. Logged as DP-004.
> Because neither breakdown becomes a chart, **echarts is not needed** and is left out of the
> dependency set entirely.

### Recent messages

Section heading `Recent messages`. Empty state is the single line `No messages yet.`

Four columns, in this order:

| Header           | Cell content                                                          |
| ---------------- | --------------------------------------------------------------------- |
| `Sender`         | `m.sender.split(':')[0]` — the part before the first colon            |
| `Content`        | `m.content`, truncated to 80 characters with `…` appended when longer |
| `Platform`       | `m.platform` in a badge                                               |
| `Classification` | `m.classification` in a colour-coded pill, or `—` when null           |

Classification pill colours are keyed off four known labels — `ENQUIRY`, `INTENT`, `PROMOTION`,
`SOCIAL` — with a neutral fallback for anything else and for null.

The table has **no actions column, no row click, no sorting, no filtering, no pagination, and no
timestamp column**. Rows are keyed by `m.id`.

> Parity note: the plan called for an AG Grid `DataView` with an actions column pinned first. AG
> Grid brings sort, filter, and pagination affordances, and an actions column would require
> inventing a row action that does not exist today. Both are behavioural changes, so the rebuild
> uses a read-only Ant Design `Table` with `pagination={false}` and no sorters, preserving the four
> columns exactly. **AG Grid and its enterprise licence are therefore not needed** and are left out.
> Logged as DP-005 and DP-007.

### Mapping

| Current                  | Replacement                                               |
| ------------------------ | --------------------------------------------------------- |
| KPI `S.card` divs        | Ant Design `Card` + `Statistic`, token-backed             |
| Priority breakdown cards | Ant Design `Card` in a `Row`/`Col` using `RESPONSIVE_COL` |
| `<table>`                | Ant Design `Table`, read-only, `pagination={false}`       |
| Platform badge           | Ant Design `Tag`                                          |
| Classification pill      | Ant Design `Tag` with a token-derived colour per label    |
| `No messages yet.`       | `Table` `locale.emptyText` with the same string           |
| Bare `Loading…`          | Centered spinner-only `Spin`                              |

---

## Onboard (`Onboard.tsx`)

Route today: `/onboard`. Route in the rebuild: `/app/onboard`, with `/onboard` redirecting there.

WhatsApp only. **This is the highest-risk screen to port**, because its behaviour lives in two
`setInterval` timers whose semantics differ from React Query's defaults.

### Phase machine

`type Phase = 'idle' | 'scanning' | 'connected' | 'error'`, initial `idle`.

### Phase `idle`

Numbered instructions, exactly:

1. `Enter a user ID (any label, e.g. your name)`
2. `Click Start — a QR code will appear`
3. `Open WhatsApp on your phone → Linked devices → Link a device`
4. `Scan the QR code`

Then a `User ID` field, placeholder `e.g. alice`, and a `Start onboarding` button.

The field is **not required**. On submit the value sent is `userId || 'default'` — the literal
string `default` when left blank.

### Start sequence

1. Clear `error`, set phase `scanning`, clear `qr`.
2. `POST /api/onboard/whatsapp/start` with `{ user_id: userId || 'default' }`.
3. Store `session_id`. If the response carries a `qr`, show it immediately.
4. Start the QR timer at **18000 ms**.
5. Start the status timer at **3000 ms**.
6. If step 2 throws: phase `error`, message = `err.message` or `Failed to start onboarding`.

Both timers are created only after a successful start.

### Timer semantics — the parity-critical part

| Timer       | Interval   | Endpoint                                | On success                            | On error                                    |
| ----------- | ---------- | --------------------------------------- | ------------------------------------- | ------------------------------------------- |
| QR refresh  | `18000 ms` | `GET /api/onboard/whatsapp/qr/{id}`     | Set `qr` **only if** `r.qr` is truthy | **Swallowed silently.** Timer keeps running |
| Status poll | `3000 ms`  | `GET /api/onboard/whatsapp/status/{id}` | Branch as below                       | **Swallowed silently.** Timer keeps running |

Status branching:

- `connected` → clear **both** timers, set phase `connected`, **then** call
  `DELETE /api/onboard/whatsapp/session/{id}` with errors swallowed.
- `expired` or `not_found` → clear both timers, set phase `error`, message is exactly
  `` `Session ${r.status} — please try again.` `` — for example `Session expired — please try again.`
- anything else → do nothing, keep polling.

The two intervals are independent and never reset each other. A status response does not
reschedule the QR timer.

React Query notes for the port: use `refetchInterval` with `retry: false`, and make the interval a
constant rather than a function of error state, so a failed poll does not stop the schedule. React
Query's default is retry-then-stop, which would silently break this.

### Phase `scanning`

| Element     | Exact text                                            |
| ----------- | ----------------------------------------------------- |
| Hint        | `Scan with WhatsApp → Linked devices → Link a device` |
| QR absent   | `Waiting for QR code…`                                |
| Status line | `Polling for connection… QR refreshes every 18 s`     |
| Button      | `Cancel`                                              |

The QR is rendered as `<img src={qr}>` at 220x220 with `alt="QR code"`.

### Cancel sequence

1. Clear both timers.
2. If a `sessionId` exists, `DELETE /api/onboard/whatsapp/session/{id}`, errors swallowed.
3. Phase `idle`, clear `qr`, clear `sessionId`.

### Phase `connected`

Check mark, then `WhatsApp connected!`, then
`Messages will now be classified automatically.`, then a `Connect another` button.

`Connect another` sets phase `idle` and clears `qr` — **and issues no request**. Note it does _not_
clear `sessionId`, which is existing behaviour and is preserved.

### Phase `error`

The error string, then a `Try again` button which returns to `idle` and issues no request.

### Unmount

```ts
useEffect(() => () => clear(), []);
```

Unmount clears both timers and **does not** call the DELETE. Do not add a cleanup mutation on
unmount, and do not let router navigation blocking introduce one.

### Mapping

| Current                                      | Replacement                                                  |
| -------------------------------------------- | ------------------------------------------------------------ |
| `S.card`                                     | Ant Design `Card`                                            |
| Instruction list                             | Ant Design `Typography` list, same four strings              |
| `User ID` input                              | `FormInput size="large"`                                     |
| Start / Cancel / Connect another / Try again | `AppButton`, same labels                                     |
| QR `<img>`                                   | `<img>` kept — it is a data URL from the server, not an icon |
| Status boxes                                 | Ant Design `Alert` with the same strings                     |
| Check-mark emoji                             | `AppIcon` success glyph                                      |

---

## Bridges (`Bridges.tsx`)

Route today: `/bridges`. Route in the rebuild: `/app/bridges`, with `/bridges` redirecting there.

### Page strings

Heading `Bridges`, subtitle `Manage connected messaging platforms.`

### Cards mounted

Exactly two, in this order:

| Platform   | Display name | Description                                                   | Connect target      |
| ---------- | ------------ | ------------------------------------------------------------- | ------------------- |
| `whatsapp` | `WhatsApp`   | `Receive and classify WhatsApp messages via mautrix-whatsapp` | `/onboard`          |
| `linkedin` | `LinkedIn`   | `Receive and classify LinkedIn messages via mautrix-linkedin` | `/onboard-linkedin` |

`/onboard-linkedin` **has no route**. Clicking LinkedIn's Connect button navigates to a path that
falls through the router's catch-all and lands on `/`. This dead link is reproduced as-is; see
DP-001.

`instagram` and `twitter` are supported by the endpoint but **not mounted**. See DP-002.

### Per-card state

`{ loading: true, status: null, error: '', actionMsg: '', acting: false }`.

### Mount sequence

Each card independently calls `GET /api/bridge/{platform}/status` in its own effect, keyed on
`platform`. Two cards means **two parallel requests** on page load.

- Success → `loading: false`, `status: r.status`.
- Failure → `loading: false`, `status: null`, `error: 'Could not reach bridge'`.

### Status presentation

| `status`         | Dot colour intent | Label                                        |
| ---------------- | ----------------- | -------------------------------------------- |
| `connected`      | success           | `Connected`                                  |
| `logged_out`     | warning           | `Logged Out`                                 |
| `disconnected`   | warning           | `Disconnected`                               |
| any other string | neutral           | Underscores to spaces, each word capitalised |
| `null`           | neutral           | `Unknown`                                    |

Label derivation is `s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())`.

While `loading` the card shows `Checking…` in place of the status row.

### Buttons

- `status === 'connected'` → `Disconnect`, which reads `Disconnecting…` while in flight.
- otherwise → `Connect`, which does `window.location.href = connectPath`.

### Disconnect sequence

1. `acting: true`, clear `actionMsg` and `error`.
2. `POST /api/bridge/{platform}/logout`.
3. Success → `acting: false`, `status: 'logged_out'`, `actionMsg: 'Disconnected successfully.'`
   The status is set locally; **no status refetch is issued.**
4. Failure → `acting: false`, `error` = `err.message` or `Logout failed`.

There is **no confirmation dialog**. The button fires immediately on click. A `useConfirm` step
would be a behavioural change; logged as DP-003.

### Mapping

| Current                      | Replacement                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| `S.card`                     | Ant Design `Card`                                                                                 |
| Status dot                   | `Badge status` with token colours                                                                 |
| Connect / Disconnect         | `AppButton`, `danger` for Disconnect, same labels                                                 |
| `window.location.href`       | Kept as a real navigation, not a router `navigate`, so the dead LinkedIn path behaves identically |
| Inline error / success lines | `<Text type="danger">` and `<Text type="success">`, same strings                                  |
| Unused `btnGray` style       | Dropped — dead code, renders nothing today                                                        |

---

## Phase 9 acceptance checklist

Run the old app and the rebuild side by side against the same sidecar and compare the DevTools
network log per screen.

- [ ] **Bootstrap** — exactly one `GET /api/auth/me`.
- [ ] **Login, sign in** — one `POST /api/auth/login`, body `{ email, password }` only.
- [ ] **Login, create account** — one `POST /api/auth/register`; `phone` key absent when the field is blank.
- [ ] **Login, OAuth** — full-page navigation to `/api/auth/oauth/{provider}/start`, no XHR.
- [ ] **Dashboard** — exactly two requests, parallel, on mount: `GET /api/stats` and `GET /api/messages/recent?limit=10`. No refetch on window focus. No polling.
- [ ] **Dashboard, API failure** — zero state renders, no error text, no retry storm.
- [ ] **Onboard, start** — one `POST /api/onboard/whatsapp/start`, body `{ user_id }` with `default` when blank.
- [ ] **Onboard, steady state** — status every 3000 ms, QR every 18000 ms, independently.
- [ ] **Onboard, poll failure** — polling continues; no user-visible error.
- [ ] **Onboard, connected** — both timers stop, then one `DELETE .../session/{id}`.
- [ ] **Onboard, expired** — both timers stop, message reads `Session expired — please try again.`
- [ ] **Onboard, cancel** — both timers stop, one `DELETE .../session/{id}`.
- [ ] **Onboard, navigate away mid-scan** — timers stop, **no** DELETE.
- [ ] **Onboard, connect another** — no request.
- [ ] **Bridges** — exactly two `GET /api/bridge/{platform}/status`, for `whatsapp` and `linkedin` only.
- [ ] **Bridges, disconnect** — one `POST /api/bridge/{platform}/logout`, no confirmation dialog, no follow-up status refetch.
- [ ] **Sign out** — one `POST /api/auth/logout`, then land on the login screen.
- [ ] **No requests to** `/api/bridge/*/login`, `/api/bridge/*/qr`, `/api/actions/pending`, `/api/user/status`, `/api/messages/classify`, or `/health`.
