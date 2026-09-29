import { rehydrateSession, useAuthStore } from '@nexa/auth';
import { MOUNTED_BRIDGE_PLATFORMS } from '@nexa/contract';
import { AppSpin } from '@nexa/shared-ui';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { BridgesPage } from '../features/bridges/pages/bridges-page';
import { DashboardPage } from '../features/dashboard/pages/dashboard-page';
import { LoginPage } from '../features/auth/pages/login-page';
import { OnboardPage } from '../features/onboard/pages/onboard-page';
import { AppearancePage } from '../features/theme/pages/appearance-page';
import { ProfilePage } from '../features/profile/pages/profile-page';
import { NotFound, RouteError } from './components/route-error';
import { GlobalThemeStyles } from './global-theme-styles';
import { AuthenticatedLayout } from './layouts/authenticated-layout';
import { PublicLayout } from './layouts/public-layout';

/**
 * Code-based routes, not the file-based generator.
 *
 * ecom-v2 does the same: the route tree is small enough to read in one file, and explicit
 * `beforeLoad` guards are easier to reason about than co-located conventions.
 */
const rootRoute = createRootRoute({
  /**
   * The single session probe. `rehydrateSession` is idempotent per page load, so navigating does
   * not re-issue `/api/auth/me` — matching the legacy app's one-shot `useEffect` in `App.tsx`.
   */
  beforeLoad: async () => {
    await rehydrateSession();
  },
  component: RootLayout,
  errorComponent: RouteError,
  notFoundComponent: NotFound,
});

function RootLayout() {
  const isRehydrating = useAuthStore((state) => state.isRehydrating);

  // The legacy app rendered a bare "Loading…" for the whole page while `api.me()` was in flight.
  // Same gate, rendered as a spinner.
  if (isRehydrating) {
    return (
      <>
        <GlobalThemeStyles />
        <AppSpin fullPage />
      </>
    );
  }

  return (
    <>
      <GlobalThemeStyles />
      <Outlet />
    </>
  );
}

function requireAuth(href: string) {
  if (!useAuthStore.getState().isAuthenticated) {
    // The legacy app rendered `<Navigate to="/login" replace />` for every route when `user` was
    // null. `redirect` is the router equivalent; `href` is kept so the user lands where they meant
    // to after signing in.
    throw redirect({ to: '/login', search: { redirect: href }, replace: true });
  }
}

/**
 * `/` stays a live route because the sidecar's OAuth callback redirects the browser there. It
 * renders nothing and forwards immediately.
 */
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: useAuthStore.getState().isAuthenticated ? '/app/dashboard' : '/login',
      replace: true,
    });
  },
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: PublicLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: '/login',
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  beforeLoad: () => {
    if (useAuthStore.getState().isAuthenticated) {
      throw redirect({ to: '/app/dashboard', replace: true });
    }
  },
  component: LoginPage,
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  beforeLoad: ({ location }) => requireAuth(location.href),
  component: AuthenticatedLayout,
});

const appIndexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard', replace: true });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const onboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/onboard/$platform',
  /**
   * Only WhatsApp is mounted. The legacy Bridges screen linked LinkedIn to `/onboard-linkedin`,
   * a route that did not exist, so LinkedIn onboarding has never worked. Building it would be new
   * behaviour, so unknown platforms 404 and the work is deferred as DP-001.
   */
  beforeLoad: ({ params }) => {
    if (params.platform !== 'whatsapp') {
      throw redirect({ to: '/app/bridges', replace: true });
    }
  },
  component: OnboardPage,
});

const bridgesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/bridges',
  component: BridgesPage,
});

const appearanceRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/appearance',
  component: AppearancePage,
});

const profileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/profile',
  component: ProfilePage,
});

/** Anyone with the old URLs bookmarked keeps working. */
const legacyOnboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboard',
  beforeLoad: () => {
    throw redirect({
      to: '/app/onboard/$platform',
      params: { platform: MOUNTED_BRIDGE_PLATFORMS[0] },
      replace: true,
    });
  },
});

const legacyBridgesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bridges',
  beforeLoad: () => {
    throw redirect({ to: '/app/bridges', replace: true });
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicLayoutRoute.addChildren([loginRoute]),
  appLayoutRoute.addChildren([
    appIndexRoute,
    dashboardRoute,
    onboardRoute,
    bridgesRoute,
    appearanceRoute,
    profileRoute,
  ]),
  legacyOnboardRoute,
  legacyBridgesRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: NotFound,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
