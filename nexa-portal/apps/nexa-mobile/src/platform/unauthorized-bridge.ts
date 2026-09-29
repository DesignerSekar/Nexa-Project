type UnauthorizedListener = () => void;

const listeners = new Set<UnauthorizedListener>();

/** Paths that legitimately return 401 without meaning "session died mid-use". */
const AUTH_PROBE_SUFFIXES = ['/api/auth/me', '/api/auth/login', '/api/auth/register'];

export function isAuthProbePath(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_PROBE_SUFFIXES.some((suffix) => url.includes(suffix));
}

export function emitUnauthorized(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeUnauthorized(listener: UnauthorizedListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
