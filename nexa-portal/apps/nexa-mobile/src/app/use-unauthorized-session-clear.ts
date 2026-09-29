import { getAuthStrategy, resetSessionRehydration, useAuthStore } from '@nexa/auth';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { subscribeUnauthorized } from '../platform';
import { useSnackbar } from './snackbar';

/** Mid-session 401 → clear token + store, land on Auth with a snackbar. */
export function useUnauthorizedSessionClear(): void {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();

  useEffect(() => {
    return subscribeUnauthorized(() => {
      void (async () => {
        await getAuthStrategy().clear();
        clear();
        resetSessionRehydration();
        queryClient.clear();
        snackbar.warning('Session expired. Please sign in again.');
      })();
    });
  }, [clear, queryClient, snackbar]);
}
