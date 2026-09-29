/**
 * The transport port.
 *
 * Core API functions depend on this interface, never on axios or fetch directly, so the React
 * Native app can supply its own implementation without touching any feature code.
 * See docs/mobile-readiness.md.
 */

/**
 * Structural stand-in for `AbortSignal`.
 *
 * The runtime object exists everywhere core has to run — browsers, React Native, Node 18+ — but
 * TypeScript only declares it in `lib.dom.d.ts`. Referencing the nominal type would force DOM
 * types into `tsconfig.core.json` and weaken the boundary check that keeps this tier
 * Metro-safe. A real `AbortSignal` is assignable to this, and so is axios's `GenericAbortSignal`.
 */
export interface AbortSignalLike {
  readonly aborted: boolean;
  addEventListener?: (...args: never[]) => unknown;
  removeEventListener?: (...args: never[]) => unknown;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  signal?: AbortSignalLike;
}

export interface HttpClient {
  get<T>(path: string, config?: RequestConfig): Promise<T>;
  post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T>;
  del<T>(path: string, config?: RequestConfig): Promise<T>;
}

let configuredClient: HttpClient | null = null;

/** Called once, from the platform composition root. */
export function setHttpClient(client: HttpClient): void {
  configuredClient = client;
}

export function getHttpClient(): HttpClient {
  if (!configuredClient) {
    throw new Error(
      'HttpClient has not been configured. Call setHttpClient() from the composition root.'
    );
  }
  return configuredClient;
}

/** Test helper: drop the configured client so each test starts clean. */
export function resetHttpClient(): void {
  configuredClient = null;
}
