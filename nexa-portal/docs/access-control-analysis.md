# Access Control and RLS Analysis

## Summary

**Neither codebase has database row-level security.** There is nothing to port from ecom-v2, only a
gap to document and a client-side scaffold to build. The rebuild does not change any access control
behaviour, because that is business-layer work.

## What ecom-v2 actually does

Despite "RLS" being the usual shorthand for this, ecom-v2 enforces access entirely in the
application layer, across three levels:

| Level            | Mechanism                                                                                                                                 | Location                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| User model       | `role: 'CUSTOMER' \| 'VENDOR' \| 'ADMIN'` plus `capabilities: string[]`, with flags `isTenantAdmin`, `isSessionAdmin`, `isImpersonating`  | `libs/auth/src/auth.store.ts`         |
| Route guards     | `beforeLoad` calling `requireAuth()`, `assertCapability("PAY")`, `assertAdminAccess()`, `assertVendorAccess()`, `assertSuperuserAccess()` | `apps/ecom-portal/src/app/router.tsx` |
| Component guards | `usePermission()` exposing `can(code)`, `isAdmin`, `isTenantAdmin`                                                                        | `libs/auth/src/usePermission.ts`      |

Multi-tenancy is also application-level, not a database policy: `GET /api/public/tenant` hydrates
`useTenantStore`, and modules are gated by the tenant's `allowedModules`.

Rule 9 of ecom-v2's own `agenct.md` is explicit about the division of responsibility:

> **RBAC on routes AND backend.** Gate `/admin/*` and protected routes via `beforeLoad` capability
> checks; the backend re-enforces every endpoint. Client gate is UX only.

Searching the ecom-v2 tree for `rls`, `row level security`, and `CREATE POLICY` returns nothing.
The `policy` hits are upload and editor policies in Storybook, unrelated to security.

## What Nexa has

Considerably less.

| Concern             | State                                                                                                                       |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Roles               | None. The `users` table has `id`, `name`, `email`, `phone`, `password_hash`, `oauth_provider`, `oauth_sub` — no role column |
| Capabilities        | None                                                                                                                        |
| Tenancy             | None. No tenant table, no tenant column, no tenant concept anywhere                                                         |
| Database            | SQLite at `data/nexa.db`. No Postgres, no Supabase, no Prisma, therefore no RLS available as a mechanism                    |
| Session storage     | `auth_sessions` table, primary key is the token, foreign key to `users(id)`                                                 |
| Session enforcement | **Only `/api/auth/me` and `/api/auth/logout` require the cookie**                                                           |

`ai/policy.py` is a classification decision table mapping labels to `NOTIFY` / `ESCALATE` /
`IGNORE`. It is not a security policy and is unrelated to access control.

## The gap

This is the finding worth escalating, recorded here rather than fixed:

**`GET /api/stats` and `GET /api/messages/recent` require no session and are not scoped to a user.**
Any unauthenticated caller who can reach the sidecar reads every user's classified message content,
senders, and platform. The `messages`, `actions`, and `user_status` tables have no `user_id` filter
applied on these read paths.

The sidecar's own OpenAPI description acknowledges most endpoints are unauthenticated on a
trusted-network assumption. That assumption does not hold once the portal is reachable from a
browser on a shared network, because the same paths are proxied through nginx at `/api/`.

The rebuild neither worsens nor improves this. It issues the same two unauthenticated reads the
current Dashboard issues.

### Recommended backend follow-up, in order

1. Add a session dependency to every `/api/*` read, so an unauthenticated caller gets a 401 rather
   than data. The dependency already exists and is used by `/api/auth/me`.
2. Filter message and action queries by the session's `user_id`. This needs a `user_id` column on
   `messages` and `actions`, populated at ingestion from the bridge that received the message.
3. Only if Nexa becomes multi-tenant, add a tenant column and scope by it. At that point Postgres
   with real RLS policies becomes worth considering over SQLite; with a single-user-per-row model,
   application-level filtering is sufficient and matches what ecom-v2 does.

Tracked as DP-008 in `deferred-proposals.md`.

## What the rebuild does build

A client-side scaffold shaped so that when the backend starts returning capabilities, only a default
value changes — no feature code moves.

### `usePermission()` in `@nexa/auth`

```ts
export function usePermission() {
  const user = useAuthStore((s) => s.user);
  return {
    can: (_code: string) => Boolean(user),
    isAuthenticated: Boolean(user),
  };
}
```

`can()` resolves to "granted for any authenticated user" because the sidecar exposes no capability
codes. The signature takes a code so call sites are already correct; the day the `/api/auth/me`
payload grows a `capabilities` array, the body becomes
`user?.capabilities.includes(code) ?? false` and nothing else changes.

This is deliberately **not** used to gate anything in the current UI, because no screen is gated
today. Adding a gate would be a behavioural change.

### `requireAuth()` at the `/app` layout route

The one guard that does run. It reproduces the existing behaviour of `App.tsx`, where a null user
means only the login screen is reachable:

```ts
beforeLoad: () => {
  if (!useAuthStore.getState().isAuthenticated) {
    throw redirect({ to: '/login' });
  }
};
```

Identical outcome to today's conditional render, expressed as a route guard.

### Branding store instead of a tenant store

ecom-v2's `tenant.store.ts` is ported in shape but seeded from a local `DEFAULT_TENANT` constant
rather than a `GET /api/public/tenant` fetch, because that endpoint does not exist in Nexa and
calling it would be inventing a request. This keeps the layout and theme code structurally
comparable to ecom-v2 without adding traffic.

## Client-side authorisation is not a control

Stating it explicitly, since the scaffold above could be mistaken for one: the session cookie is
HttpOnly, so the client cannot inspect or forge it, but every check in the portal is a UX
affordance. A user who opens DevTools can call any endpoint the sidecar exposes. The controls that
matter are the two backend items above.
