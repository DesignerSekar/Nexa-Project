import { setAuthStrategy, setKeyValueStore } from '@nexa/auth';
import { setHttpClient } from '@nexa/data';
import { cookieAuthStrategy, localStorageStore, webHttpClient } from '@nexa/platform-web';

/**
 * The only place web platform modules are wired to core ports.
 *
 * Feature code imports `@nexa/data` and `@nexa/auth` and never `@nexa/platform-web`, which is
 * what lets the React Native app swap in its own adapters without any feature edits. The ESLint
 * boundary rules enforce this; this file is the single sanctioned exception.
 *
 * Must run before the first render, since route loaders fire immediately. The 401 listener is
 * installed separately by `useUnauthorizedRedirect`, because it needs the router.
 */
export function configurePlatform(): void {
  setHttpClient(webHttpClient);
  setAuthStrategy(cookieAuthStrategy);
  setKeyValueStore(localStorageStore);
}
