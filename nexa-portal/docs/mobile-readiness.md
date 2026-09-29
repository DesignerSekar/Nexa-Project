# Mobile Readiness

**Status: mobile app lives at `apps/nexa-mobile` (Expo 54).** Core packages are reused verbatim;
platform adapters are bound in `apps/nexa-mobile/src/app/composition-root.ts`.

## The boundary

The workspace is tiered. `libs/core/*` is platform-neutral and is what mobile reuses.
`libs/web/*` stays quarantined (no React Native target).

| Package              | Tier | Mobile reuses it? | Why                                                                         |
| -------------------- | ---- | ----------------- | --------------------------------------------------------------------------- |
| `@nexa/contract`     | core | **Yes, verbatim** | Plain types and path constants, zero runtime dependencies                   |
| `@nexa/data`         | core | **Yes, verbatim** | TanStack Query runs under Metro; the `HttpClient` is injected, not imported |
| `@nexa/auth`         | core | **Yes, verbatim** | Zustand runs under Metro; the auth transport is behind `AuthStrategy`       |
| `@nexa/schemas`      | core | **Yes, verbatim** | Zod runs under Metro                                                        |
| `@nexa/tokens`       | core | **Yes, verbatim** | Plain objects; Paper reads the same palette                                 |
| `@nexa/util`         | core | **Yes, verbatim** | Pure formatters                                                             |
| `@nexa/platform-web` | web  | No                | axios with `withCredentials`, `localStorage`, `window` events               |
| `@nexa/theme-web`    | web  | No                | Maps tokens onto Ant Design's algorithm                                     |
| `@nexa/shared-ui`    | web  | No                | Ant Design 6, `@ant-design/cssinjs`, Tailwind                               |
| `apps/nexa-portal`   | web  | No                | TanStack Router, Vite                                                       |
| `apps/nexa-mobile`   | mobile | —               | Expo RN, React Navigation 7, React Native Paper                             |

### Web vs native UI

| Web                                  | Native                                      |
| ------------------------------------ | ------------------------------------------- |
| Ant Design 6 + `@ant-design/cssinjs` | React Native Paper                          |
| TanStack Router                      | React Navigation 7                          |
| Ant Design `Table` / AG Grid         | FlatList                                    |
| Vite                                 | Metro                                       |

## Adapters (implemented)

| Port             | Mobile file                                              |
| ---------------- | -------------------------------------------------------- |
| `HttpClient`     | `apps/nexa-mobile/src/platform/http-client.ts`           |
| `AuthStrategy`   | `apps/nexa-mobile/src/platform/token-auth-strategy.ts`   |
| `KeyValueStore`  | `apps/nexa-mobile/src/platform/async-storage-store.ts`   |
| Env              | `EXPO_PUBLIC_API_URL` via `src/platform/env.ts`          |

The fetch client **must** call `AuthStrategy.attach()` before every request (Bearer injection).
Errors use the same `buildApiError` contract as web.

## DP-009 — done (session transport only)

Login/register JSON includes `token` (existing `auth_sessions` primary key). `GET /api/auth/me`
and `POST /api/auth/logout` accept `Authorization: Bearer` alongside the cookie. Web cookie auth
is unchanged. No AI/bridge/classify/schema changes.

## Native OAuth

Still deferred. Auth screen shows Google/GitHub as disabled (“use web”). When scheduled: use
`expo-auth-session` + deep link against binding #5 only — do not invent a new OAuth API. Sidecar
callback may need to honour a custom scheme (separate change).

## Runbook

See [`apps/nexa-mobile/README.md`](../apps/nexa-mobile/README.md) for Android Studio AVD steps
(`10.0.2.2:8080` → host sidecar).

## Parity checklist

[`apps/nexa-mobile/docs/parity-checklist.md`](../apps/nexa-mobile/docs/parity-checklist.md)

## Legacy shells

- Superseded: `Nexa-FrontEnd-main/.../mobile` hand-rolled `api/client` + `AuthContext`.
- Not the product path: Kotlin `Nexa-FrontEnd-main/.../app` debug shell. Android Studio is used
  for SDK + emulator only.
