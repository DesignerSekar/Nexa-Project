# API Contract (Frozen)

This is the frozen inventory of the Nexa sidecar surface as consumed by the **existing** web client.
It is transcribed from `Nexa-FrontEnd-main/src/api.ts` and cross-checked against
`nexa-beeper-connector-main/sidecar/main.py`.

**This document is the reference that proves the business layer is untouched.** The rebuilt portal
must call exactly these paths, with exactly these methods, bodies, and response shapes. Any
deviation found during review is a defect in the migration.

## Transport rules

| Concern              | Value                                                                                    | Source            |
| -------------------- | ---------------------------------------------------------------------------------------- | ----------------- |
| Base URL             | `import.meta.env.VITE_API_URL ?? ''` — empty in production so calls hit the same origin  | `src/api.ts`      |
| Credentials          | `credentials: 'include'` on every request                                                | `src/api.ts`      |
| Auth mechanism       | HttpOnly cookie `nexa_session`, set and cleared by the server                            | `sidecar/main.py` |
| Auth header          | Web: none (cookie). Mobile: `Authorization: Bearer` after DP-009                         | web / mobile      |
| Request content type | `application/json` on every request, including GET and DELETE                            | `src/api.ts`      |
| Success detection    | `res.ok`; body parsed with `res.json()`                                                  | `src/api.ts`      |
| Error envelope       | `{ detail: string }` (FastAPI). Falls back to `res.statusText` when the body is not JSON | `src/api.ts`      |
| Error object         | `Error(detail)` with a `status` property attached                                        | `src/api.ts`      |

The error handling in the current client is worth quoting exactly, because the rebuilt
`extractApiError` must reproduce it:

```ts
if (!res.ok) {
  const err = await res.json().catch(() => ({ detail: res.statusText }));
  throw Object.assign(new Error(err.detail ?? 'Request failed'), { status: res.status });
}
```

So the message precedence is: `detail` from the JSON body, then the literal `'Request failed'` if
the body parsed but had no `detail`, then `res.statusText` if the body was not JSON at all.

## Bindings

`src/api.ts` exports 14 bindings. **13 are consumed by a screen**; `health` is defined but never
called from the UI. The rebuild keeps all 14 in the data layer so the contract stays complete, but
adds no new caller for `health`.

### Auth

| #   | Method | Path                               | Request body                                                              | Response                                                         | Consumed by                             |
| --- | ------ | ---------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------- |
| 1   | `POST` | `/api/auth/register`               | `{ name, email, password, phone? }` — `phone` omitted entirely when falsy | `{ success: boolean, user: User, token?: string }` (DP-009)      | Login screen, Create-account tab        |
| 2   | `POST` | `/api/auth/login`                  | `{ email, password }`                                                     | `{ success: boolean, user: User, token?: string }` (DP-009)      | Login screen, Sign-in tab               |
| 3   | `GET`  | `/api/auth/me`                     | — (cookie or `Authorization: Bearer`)                                     | `{ authenticated: boolean, user?: User }`                        | App bootstrap                           |
| 4   | `POST` | `/api/auth/logout`                 | — (cookie or `Authorization: Bearer`)                                     | `{ success: boolean }`                                           | Sidebar sign-out                        |
| 5   | `GET`  | `/api/auth/oauth/{provider}/start` | —                                                                         | **Not fetched.** Full-page navigation via `window.location.href` | Login screen, Google and GitHub buttons |

`provider` is `'google' | 'github'`.

Binding 5 is not an XHR. The current implementation is:

```ts
oauthStart: (provider: 'google' | 'github') => {
  window.location.href = `${BASE}/api/auth/oauth/${provider}/start`
},
```

The server completes the flow by setting the cookie and redirecting the browser to `/`. **This is
why `/` must remain a resolvable route in the rebuild.**

After DP-009, `register` and `login` also return `token` (the `auth_sessions` primary key) for
mobile Bearer clients. Web continues to rely on the `nexa_session` cookie and ignores `token`.

### WhatsApp onboarding

| #   | Method   | Path                                        | Request body          | Response                                 | Consumed by                                  |
| --- | -------- | ------------------------------------------- | --------------------- | ---------------------------------------- | -------------------------------------------- |
| 6   | `POST`   | `/api/onboard/whatsapp/start`               | `{ user_id: string }` | `OnboardResult`                          | Onboard screen, Start                        |
| 7   | `GET`    | `/api/onboard/whatsapp/status/{sessionId}`  | —                     | `{ status: string }`                     | Onboard screen, 3000 ms poll                 |
| 8   | `GET`    | `/api/onboard/whatsapp/qr/{sessionId}`      | —                     | `{ qr: string \| null, status: string }` | Onboard screen, 18000 ms refresh             |
| 9   | `DELETE` | `/api/onboard/whatsapp/session/{sessionId}` | —                     | `{ status: string }`                     | Onboard screen, on `connected` and on Cancel |

Observed `status` values the UI branches on: `connected`, `expired`, `not_found`. Any other value is
treated as "still waiting" and polling continues.

### Bridges

| #   | Method | Path                            | Request body | Response                                 | Consumed by                       |
| --- | ------ | ------------------------------- | ------------ | ---------------------------------------- | --------------------------------- |
| 10  | `GET`  | `/api/bridge/{platform}/status` | —            | `{ status: string, bridge_bot: string }` | Bridges screen, on mount per card |
| 11  | `POST` | `/api/bridge/{platform}/logout` | —            | `{ status: string }`                     | Bridges screen, Disconnect        |

The sidecar accepts `platform` in `whatsapp | linkedin | instagram | twitter`. **The current web UI
only ever sends `whatsapp` and `linkedin`**, because only those two cards are mounted. The rebuild
preserves that; see `deferred-proposals.md` entry DP-002.

Observed `status` values the UI branches on: `connected` drives the Disconnect button and green dot;
`logged_out` and `disconnected` drive the amber dot; anything else is grey. `bridge_bot` is returned
but **never read** by the UI.

### Stats and messages

| #   | Method | Path                   | Query   | Response                                 | Consumed by |
| --- | ------ | ---------------------- | ------- | ---------------------------------------- | ----------- |
| 12  | `GET`  | `/api/stats`           | —       | `Stats`                                  | Dashboard   |
| 13  | `GET`  | `/api/messages/recent` | `limit` | `{ messages: Message[], count: number }` | Dashboard   |

`recentMessages` has a default of `20` in `api.ts`, but **the Dashboard calls it with `10`**. The
rebuild must send `limit=10`, matching the live request rather than the function default.

`count` is returned but **never read** by the UI.

### System

| #   | Method | Path      | Response             | Consumed by                                    |
| --- | ------ | --------- | -------------------- | ---------------------------------------------- |
| 14  | `GET`  | `/health` | `{ status: string }` | **Nothing.** Defined in `api.ts`, never called |

## Types

Transcribed verbatim from `src/api.ts`. These become `@nexa/contract`.

```ts
interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

interface Stats {
  total_messages: number;
  pending_actions: number;
  priority_breakdown: Record<string, number>;
  classifier_breakdown: Record<string, number>;
  classifier: string;
}

interface Message {
  id: string;
  platform: string;
  sender: string;
  content: string;
  timestamp: number;
  classification: string | null;
  confidence: number | null;
}

interface OnboardResult {
  session_id: string;
  status: string;
  qr: string | null;
  matrix_user_id: string;
}
```

### Fields fetched but not displayed

These are part of the contract and are typed, but no current screen renders them. The rebuild does
**not** start displaying them, since that would be a new feature rather than a restyle.

| Field                          | Type                     | Note                                                                |
| ------------------------------ | ------------------------ | ------------------------------------------------------------------- |
| `Stats.classifier_breakdown`   | `Record<string, number>` | Fetched on the Dashboard, never rendered. See DP-004                |
| `Message.timestamp`            | `number`                 | No timestamp column exists in the recent-messages table. See DP-005 |
| `Message.confidence`           | `number \| null`         | Never rendered                                                      |
| `OnboardResult.matrix_user_id` | `string`                 | Never rendered                                                      |
| `OnboardResult.status`         | `string`                 | Read from the start response but not branched on; only `qr` is used |
| bridge `bridge_bot`            | `string`                 | Never rendered                                                      |
| messages `count`               | `number`                 | Never rendered                                                      |

## Endpoints the sidecar exposes that the web UI does not call

Listed for completeness, to make it explicit that the rebuild must **not** start calling them.
From `sidecar/main.py`:

- `POST /api/bridge/{platform}/login` and `GET /api/bridge/{platform}/qr` — generic bridge
  onboarding. See DP-001.
- `POST /api/messages/classify`, `POST /api/messages/incoming` — classification and the ingestion
  webhook.
- `POST /api/user/status`, `GET /api/user/status` — availability.
- `GET /api/actions/pending` — the pending-action queue.
- `GET /api/auth/status` — Matrix admin token status, unrelated to the app session.
- `GET /api/auth/sso/start`, `GET /api/auth/sso/callback` — Matrix SSO.
- `GET /api/auth/oauth/{provider}/callback` — server-side leg of binding 5.
- `/docs`, `/redoc`, `/dev` — API documentation pages.
