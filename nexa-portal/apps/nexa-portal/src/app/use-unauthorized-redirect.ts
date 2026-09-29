import { resetSessionRehydration, useAuthStore } from '@nexa/auth';
import { onUnauthorized } from '@nexa/platform-web';
import { useToast } from '@nexa/shared-ui/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { router } from './router';

/**
 * Turns a transport-level 401 into a trip back to the login screen.
 *
 * The axios interceptor cannot navigate, so it emits a window event; this is the one listener.
 * Auth probes are already filtered out at the interceptor, so reaching here always means a session
 * that was valid and is not any more.
 *
 * Must run under `AppConfigProvider` so `useToast` can reach `App.useApp()`.
 */
export function useUnauthorizedRedirect(): void {
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(
    () =>
      onUnauthorized(() => {
        useAuthStore.getState().clear();
        resetSessionRehydration();
        queryClient.clear();
        toast.warning('Your session has expired. Please sign in again.', {
          title: 'Signed out',
        });
        void router.navigate({ to: '/login', search: { redirect: undefined }, replace: true });
      }),
    [queryClient, toast]
  );
}
