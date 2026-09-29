import { setAuthStrategy, setKeyValueStore } from '@nexa/auth';
import { setHttpClient } from '@nexa/data';
import { asyncStorageStore, mobileHttpClient, tokenAuthStrategy } from '../platform';

/**
 * Binds mobile platform adapters to core ports. Must run before the first render / `/me` probe.
 */
export function configurePlatform(): void {
  setHttpClient(mobileHttpClient);
  setAuthStrategy(tokenAuthStrategy);
  setKeyValueStore(asyncStorageStore);
}
