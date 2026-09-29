import { getAuthStrategy, resetSessionRehydration, useAuthStore } from '@nexa/auth';
import { authApi } from '@nexa/data';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useSnackbar } from '../../app/snackbar';

export function useLogout() {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const clear = useAuthStore((s) => s.clear);
  const [isPending, setPending] = useState(false);

  const logout = useCallback(async () => {
    setPending(true);
    try {
      await authApi.logout();
    } catch {
      snackbar.warning('Signed out locally. The server logout request failed.');
    } finally {
      await getAuthStrategy().clear();
      clear();
      resetSessionRehydration();
      queryClient.clear();
      setPending(false);
    }
  }, [clear, queryClient, snackbar]);

  return { logout, isPending };
}
