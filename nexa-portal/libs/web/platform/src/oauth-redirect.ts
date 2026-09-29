import { endpoints, type OAuthProvider } from '@nexa/contract';
import { env } from './env';

/**
 * Starts an OAuth flow, reproducing the legacy client exactly:
 *
 *   window.location.href = `${BASE}/api/auth/oauth/${provider}/start`
 *
 * This is a full-page navigation and not an XHR, so it cannot go through `HttpClient`. It lives
 * in the web tier because `window.location` has no meaning on native — mobile will open the same
 * URL in an in-app browser session instead.
 *
 * The sidecar's callback redirects the browser back to `/`, which is why `/` remains a live route.
 */
export function startOAuthRedirect(provider: OAuthProvider): void {
  window.location.href = `${env.VITE_API_URL}${endpoints.auth.oauthStart(provider)}`;
}
