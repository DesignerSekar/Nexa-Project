import { getAuthStrategy, resetSessionRehydration, useAuthStore } from '@nexa/auth';
import { authApi } from '@nexa/data';
import { useToast } from '@nexa/shared-ui/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

/**
 * Sign out, reproducing `App.tsx`'s `handleLogout`:
 *
 *   await api.logout().catch(() => {}); setUser(null); navigate('/login')
 *
 * A failed logout still clears local state and leaves — trapping the user is worse — but we
 * surface a soft warning toast so the failure is not silent.
 */
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const clear = useAuthStore((state) => state.clear);
  const [isPending, setPending] = useState(false);

  const logout = useCallback(async () => {
    setPending(true);
    try {
      await authApi.logout();
    } catch {
      toast.warning('Signed out locally. The server logout request failed.', {
        title: 'Signed out',
      });
    } finally {
      await getAuthStrategy().clear();
      clear();
      resetSessionRehydration();
      queryClient.clear();
      setPending(false);
      await navigate({ to: '/login', search: { redirect: undefined }, replace: true });
    }
  }, [clear, navigate, queryClient, toast]);

  return { logout, isPending };
}
