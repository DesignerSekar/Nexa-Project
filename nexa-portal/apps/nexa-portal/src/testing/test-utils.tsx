import { setAuthStrategy, setKeyValueStore } from '@nexa/auth';
import { setHttpClient } from '@nexa/data';
import { cookieAuthStrategy, localStorageStore, webHttpClient } from '@nexa/platform-web';
import { DEFAULT_APP_CONFIG } from '@nexa/theme-web';
import { AppConfigProvider } from '@nexa/shared-ui/providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';

/**
 * Binds the same ports the app's composition root binds, so tests exercise the real axios client
 * against MSW rather than a stub. A stub would hide exactly the things worth testing: cookie
 * credentials, the FastAPI error shape, and the request URLs.
 */
export function configureTestPlatform(): void {
  setHttpClient(webHttpClient);
  setAuthStrategy(cookieAuthStrategy);
  setKeyValueStore(localStorageStore);
}

/**
 * A fresh QueryClient per test with retries off, so one test's cache cannot satisfy another's
 * request and make a missing fetch look like a passing parity check.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: 0 },
    },
  });
}

interface RenderWithProvidersResult extends RenderResult {
  queryClient: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderWithProvidersResult {
  configureTestPlatform();
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AppConfigProvider config={DEFAULT_APP_CONFIG}>{children}</AppConfigProvider>
      </QueryClientProvider>
    );
  }

  return { ...render(ui, { wrapper: Wrapper, ...options }), queryClient };
}
