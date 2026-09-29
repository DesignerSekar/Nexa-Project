/**
 * Transport-level 401 signalling.
 *
 * The axios interceptor cannot navigate, and core cannot touch the DOM, so the 401 crosses the
 * boundary as a window event that the app's composition root listens for.
 *
 * `/api/auth/me` is excluded: that probe returning 401 is the normal "not signed in" path on
 * every cold load, and treating it as a session expiry would bounce first-time visitors with a
 * spurious message.
 */
export const UNAUTHORIZED_EVENT = 'nexa:unauthorized';

const PROBE_PATHS = ['/api/auth/me', '/api/auth/login', '/api/auth/register'];

export function isAuthProbePath(url: string | undefined): boolean {
  if (!url) return false;
  return PROBE_PATHS.some((path) => url.includes(path));
}

export function emitUnauthorized(): void {
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

export function onUnauthorized(handler: () => void): () => void {
  window.addEventListener(UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
}
