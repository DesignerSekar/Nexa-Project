import { authApi } from '@nexa/data';
import { useAuthStore } from './auth.store';

/**
 * Bootstrap, reproducing `App.tsx`:
 *
 *   api.me().then(r => { if (r.authenticated && r.user) setUser(r.user) })
 *      .catch(() => {}).finally(() => setLoading(false))
 *
 * Errors are swallowed on purpose. A failed probe means "not signed in", not "show an error" —
 * the legacy app renders the login screen either way.
 *
 * Runs at most once per page load. TanStack Router's `beforeLoad` fires on every navigation, so
 * the guard below stops it turning one request into several.
 */
let rehydrated = false;

export async function rehydrateSession(): Promise<void> {
  if (rehydrated) return;
  rehydrated = true;

  const { setUser, setRehydrating } = useAuthStore.getState();

  try {
    const result = await authApi.me();
    if (result.authenticated && result.user) {
      setUser(result.user);
    }
  } catch {
    // Not signed in, or the sidecar is unreachable. Both land on the login screen.
  } finally {
    setRehydrating(false);
  }
}

/** Lets sign-out and the 401 bridge force a fresh probe on the next navigation. */
export function resetSessionRehydration(): void {
  rehydrated = false;
}
