---
description: Rules for the Nexa portal UI migration. Applies to all work in this workspace.
globs:
  - 'apps/**'
  - 'libs/**'
alwaysApply: true
---

# Nexa Portal Rules

You are migrating the Nexa web UI from a hand-rolled React 18 SPA to this workspace, adopting the
architecture and conventions of the CRM/e-com v2 portal. The legacy app at
`Nexa-FrontEnd-main/src/` is a **read-only reference for behaviour**, never a spec to reinvent.

## Rule 0 — The constraint that outranks everything else

**This is a UI-layer migration. The existing business layer and functions are not touched.**

This rule overrides every other rule in this file. Where a convention below cannot be adopted
without changing behaviour, **behaviour wins and the convention is dropped**, with a note in
`docs/deferred-proposals.md` explaining why.

Specifically:

- **No backend edits.** Nothing in `nexa-beeper-connector-main`.
- **No new endpoint calls.** The surface is exactly the bindings in `docs/api-contract.md`. Do not
  start calling an endpoint the legacy UI never called, even if the sidecar exposes it.
- **No changed request cadence, order, or parallelism.**
- **No added confirmation, validation, or navigation step.**
- **No newly displayed fields.** Several fields cross the wire and are discarded today; they stay
  discarded.
- **No silent bug fixes.** Reproduce the bug and log the fix as a proposal.

Improvements go in `docs/deferred-proposals.md`. A reviewer treats **any unexplained delta in the
DevTools network log** as a defect. `docs/screen-inventory.md` is the parity baseline and the
acceptance criteria.

## Stack (do not deviate)

- React 19 + TypeScript (strict) · Ant Design 6 · TanStack Router + Query 5
- Zustand · React Hook Form + Zod · Nx + pnpm + Vite
- Vitest + RTL · Playwright · MSW · Storybook
- Core libraries: `@nexa/contract`, `@nexa/data`, `@nexa/auth`, `@nexa/schemas`, `@nexa/tokens`,
  `@nexa/util`
- Web libraries: `@nexa/platform-web`, `@nexa/theme-web`, `@nexa/shared-ui`

Deliberately **not** in the stack, because parity removed the need: AG Grid (see DP-007) and
echarts (see DP-004). Do not add either without the corresponding proposal being accepted.

## Golden rules

1. **Reuse the backend.** NEVER reimplement business logic in React. If a rule seems missing from
   the UI, it lives in the sidecar — leave it there.
2. **Parity before improvement.** Match the legacy exactly: fields, actions, messages, edge cases.
   Propose enhancements separately.
3. **One feature slice per branch and PR.** Never a big-bang merge.
4. **Core stays platform-neutral.** `libs/core/**` must not import `antd`, `@tanstack/react-router`,
   or anything web-only, and must not touch `window`, `document`, `localStorage`, `navigator`, or
   `import.meta`. This is enforced by ESLint and by running core tests in a `node` environment. The
   React Native app depends on this holding.
5. **Ports, not platform imports.** Feature code never imports `@nexa/platform-web` directly.
   Platform implementations are bound in `apps/nexa-portal/src/app/composition-root.ts`.
6. **shared-ui only.** Always use the wrappers — `AppButton`, `AppModal`, `AppDrawer`, `AppTabs`,
   `useConfirm`, `useToast` — never raw Ant Design `message` or `Modal`.
7. **Types from the contract.** All API types come from `@nexa/contract`, transcribed from
   `src/api.ts` and cross-checked against `sidecar/main.py`. No `any` — use `unknown`. There is no
   OpenAPI spec for the sidecar, so hand-written contract types are the documented exception to
   ecom-v2's generate-from-spec rule.
8. **State model is fixed.** Server state = React Query, client/UI state = Zustand, view/filter
   state = URL search params. No other global stores.
9. **RBAC is UX only.** The client gate is an affordance; the backend is the control. See
   `docs/access-control-analysis.md` — and note that today the sidecar enforces almost nothing, so
   do not imply otherwise in the UI.
10. **No secrets in the client bundle.** Config via Zod-validated env. Never `VITE_*` credentials.
11. **React Compiler.** No `memo`, `useCallback`, or `useMemo` by default. Do not use `useEffect` to
    derive or normalize state synchronously.

## UI consistency patterns

1. **Token-only styling.** No inline `style={{}}` props. No hardcoded colours, spacing, font sizes,
   or radii. No `#hex`, `rgb()`, or `rgba()` literals in components. Derive everything from Ant
   Design tokens via `theme.useToken()` inside a style injector, or from `@nexa/tokens`. Register
   reusable classes in `global-theme-styles.tsx`; feature-specific overrides follow the
   `AppIconStyles` pattern of a co-located component injecting a scoped `<style>` block.
2. **Custom scrollbars project-wide.** Every scrolling surface uses the `custom-scroll` class —
   page content, forms, drawers, modals, sidebars, table wrappers, overflow toolbars. Thin 6px
   scrollbar, transparent track, `colorTextQuaternary` thumb, `colorTextTertiary` on hover. A
   missing `custom-scroll` on a scrolling region is a defect.
3. **Input sizing.** All `Input`, `Select`, and `AutoComplete` form fields use `size="large"`. Never
   set a fixed `height`.
4. **Input background.** Default white. Do not tint with `colorBgLayout`.
5. **Autofill reset.** Every form module includes the `input:-webkit-autofill` rules with
   `-webkit-box-shadow: 0 0 0 1000px #ffffff inset !important` and the long `transition` hack, so
   the browser's autofill tint never appears.
6. **Labels and required fields.** Use the `form-field-label` class. A required field shows a red
   asterisk **after** the label text — `Field Name *` — via `<Text type="danger"> *</Text>`, never
   before.
7. **Error text.** `<Text type="danger" className="form-field-error">`.
8. **Loading spinners.** Spinner only — no `tip`, no `description`, no adjacent "Loading…" text.
   Centered in a flex container via `module-loading-center`. Accessibility label goes on the
   wrapper as `aria-label="Loading"`, not as visible copy.
   - Parity exception: the Dashboard uses a single page-level loading gate rather than per-section
     overlays, because that is what the legacy screen does. See DP-006.
9. **Icon system.** All icons are `lucide-react` through the `AppIcon` wrapper, registered in
   `icon-map.ts`. Nav icons use `variant="nav"` — `colorText` by default, primary when selected.
   Never import `@ant-design/icons`.
   - Exception: the Google and GitHub brand marks on the login screen stay as inline SVG. Lucide has
     no brand glyphs and substituting them would change the visual.
10. **Module titles in Title Case.** Never ALL CAPS. Import display names from
    `constants/module-titles.ts` and render through `ModuleScreenHeader`. Do not hardcode
    `fontSize` on titles.
11. **Sidebar.** Fixed 80px icon rail. Expanding overlays the content with a shadow using a fixed
    `marginLeft: 80`, so the page never reflows or shifts.
12. **Light and dark theme, light by default.** Tokens come from one root `AppConfigProvider` via
    `buildAntdTheme`. `NexaThemeProvider` is a thin shell for `GlobalThemeStyles`, `AppIconStyles`,
    and fonts — do not nest a second `ConfigProvider`. The mode toggle lives in the header and
    persists to `nexa-user-theme-config`. Keep `html.dark` in sync.
13. **Responsive across four tiers** via `useResponsiveLayout`: mobile `< 768px` with drawer
    navigation and stacked headers; tablet `768–991px`; web `992–1599px` with the 80px rail;
    monitor `>= 1600px` with a max-width centered shell. Use `RESPONSIVE_COL` spans and wrap feature
    routes in `FeaturePageShell`. Test at 375px, 768px, 1024px, and 1600px.
14. **Tooltips on icon-only actions.** Any actionable control whose purpose is not obvious from
    visible text gets an Ant Design `<Tooltip>` with a short Title Case title.
15. **camelCase identifiers.** Components, types, and interfaces are PascalCase. No `snake_case` for
    variables or functions — note that API payload fields _are_ snake_case and must not be renamed
    when they cross the contract boundary.

## Feature slice layout

Thin route files; logic in controller hooks; no barrel files; direct imports.

```
apps/nexa-portal/src/features/<name>/
├── <name>-route.tsx          thin: renders the controller's output
├── hooks/use-<name>-controller.ts
├── components/
└── types/                    UI-only types
```

The `api/` trio lives in **core**, not in the feature folder, so mobile can reuse it:

```
libs/core/data/src/<domain>/
├── <domain>.api.ts           functions taking an injected HttpClient
├── <domain>.keys.ts          query key factory
└── <domain>.queries.ts       queryOptions builders and hooks
```

Domain names match feature names one-to-one: `auth`, `dashboard`, `onboard`, `bridges`.

## Forms

React Hook Form plus Zod, one schema driving both UI and submit. Schemas live in `@nexa/schemas`
because mobile needs the same rules. Fields use the `Form*` wrappers built on `useController`.

**Encode only the validation the legacy form actually enforces.** Today that is browser-native
`required` and `type="email"`, nothing more. Adding a password-length rule rejects input the
current form accepts. See DP-011.

## When unsure

Stop and ask. If a request conflicts with `docs/api-contract.md`, `docs/screen-inventory.md`, or
Rule 0, surface the mismatch — do not create workarounds, shims, or type stubs to paper over it.
