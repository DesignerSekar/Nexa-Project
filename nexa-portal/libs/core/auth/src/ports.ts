import type { AuthResponse } from '@nexa/contract';
import type { RequestConfig } from '@nexa/data';

/**
 * How credentials travel.
 *
 * Web uses `CookieAuthStrategy`, where every method is effectively a no-op because the sidecar
 * sets and clears the HttpOnly `nexa_session` cookie itself and axios sends it via
 * `withCredentials`. Mobile binds `TokenAuthStrategy` (Bearer from `AuthResponse.token`).
 */
export interface AuthStrategy {
  readonly kind: 'cookie' | 'token';
  attach(config: RequestConfig): Promise<RequestConfig> | RequestConfig;
  onAuthSuccess(response: AuthResponse): Promise<void> | void;
  clear(): Promise<void> | void;
}

/**
 * Key-value persistence.
 *
 * Needed because Zustand `persist` has no storage that works on both platforms: web has
 * `localStorage`, native has `AsyncStorage`.
 */
export interface KeyValueStore {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

let configuredStore: KeyValueStore | null = null;

export function setKeyValueStore(store: KeyValueStore): void {
  configuredStore = store;
}

export function getKeyValueStore(): KeyValueStore {
  if (!configuredStore) {
    throw new Error(
      'KeyValueStore has not been configured. Call setKeyValueStore() from the composition root.'
    );
  }
  return configuredStore;
}

export function resetKeyValueStore(): void {
  configuredStore = null;
}

let configuredStrategy: AuthStrategy | null = null;

export function setAuthStrategy(strategy: AuthStrategy): void {
  configuredStrategy = strategy;
}

export function getAuthStrategy(): AuthStrategy {
  if (!configuredStrategy) {
    throw new Error(
      'AuthStrategy has not been configured. Call setAuthStrategy() from the composition root.'
    );
  }
  return configuredStrategy;
}

export function resetAuthStrategy(): void {
  configuredStrategy = null;
}
