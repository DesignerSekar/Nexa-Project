import { queryClient } from '@nexa/data';
import { AppConfigProvider } from '@nexa/shared-ui/providers';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useAppConfigValue } from '../features/theme/stores/app-config.store';
import { router } from './router';
import { useUnauthorizedRedirect } from './use-unauthorized-redirect';

/**
 * Provider chain, outermost first: React Query, then theme, then the router.
 *
 * Theme wraps the router so `theme.useToken()` and `App.useApp()` resolve inside every route.
 */
export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemedRouter />
    </QueryClientProvider>
  );
}

/** Runs under AntdApp so session toasts can use `useToast`. */
function SessionGuard({ children }: { children: ReactNode }) {
  useUnauthorizedRedirect();
  return children;
}

function ThemedRouter() {
  const config = useAppConfigValue();

  return (
    <AppConfigProvider config={config}>
      <SessionGuard>
        <RouterProvider router={router} />
      </SessionGuard>
    </AppConfigProvider>
  );
}
