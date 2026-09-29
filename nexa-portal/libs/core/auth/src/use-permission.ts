import { useAuthStore } from './auth.store';

/**
 * Capability scaffold.
 *
 * The sidecar has no roles, no capabilities, and no tenancy, so `can()` resolves to "granted for
 * any signed-in user". The signature takes a code so call sites are already correct: the day
 * `/api/auth/me` grows a `capabilities` array, this body becomes
 * `user?.capabilities.includes(code) ?? false` and nothing else in the app moves.
 *
 * Nothing in the current UI is gated by this, because nothing is gated today. Adding a gate would
 * be a behavioural change. See docs/access-control-analysis.md.
 */
export function usePermission() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return {
    can: (_code: string) => isAuthenticated,
    isAuthenticated,
    user,
  };
}
