import type { AuthStrategy } from '@nexa/auth';
import type { RequestConfig } from '@nexa/data';

/**
 * Small on purpose.
 *
 * The sidecar sets `nexa_session` on login and clears it on logout, and axios sends it via
 * `withCredentials`, so there is genuinely nothing for the client to do. This exists so the seam
 * is real and exercised rather than theoretical: when mobile adds a `TokenAuthStrategy`, it slots
 * in here and no feature code changes.
 */
export const cookieAuthStrategy: AuthStrategy = {
  kind: 'cookie',

  attach(config: RequestConfig): RequestConfig {
    return config;
  },

  onAuthSuccess(): void {
    // The Set-Cookie header did the work.
  },

  clear(): void {
    // The cookie is HttpOnly; only POST /api/auth/logout can clear it.
  },
};
