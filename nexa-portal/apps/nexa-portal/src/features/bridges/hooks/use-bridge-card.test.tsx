import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_APP_CONFIG } from '@nexa/theme-web';
import { AppConfigProvider } from '@nexa/shared-ui/providers';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { server } from '../../../mocks/server';
import { startRequestLog } from '../../../testing/request-log';
import { configureTestPlatform, createTestQueryClient } from '../../../testing/test-utils';
import { useBridgeCard } from './use-bridge-card';

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider config={DEFAULT_APP_CONFIG}>{children}</AppConfigProvider>
    </QueryClientProvider>
  );
}

describe('useBridgeCard', () => {
  let log: ReturnType<typeof startRequestLog>;

  beforeEach(() => {
    configureTestPlatform();
    log = startRequestLog();
  });

  afterEach(() => log.stop());

  it('fetches status once on mount', async () => {
    const { result } = renderHook(() => useBridgeCard('whatsapp'), { wrapper });

    await waitFor(() => expect(result.current.isChecking).toBe(false));
    expect(result.current.status).toBe('connected');
    expect(result.current.isConnected).toBe(true);
    expect(log.requests).toEqual([{ method: 'GET', path: '/api/bridge/whatsapp/status' }]);
  });

  it('shows the literal "Could not reach bridge" and falls back to Connect on failure', async () => {
    server.use(
      http.get('/api/bridge/:platform/status', () =>
        HttpResponse.json({ detail: 'nope' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useBridgeCard('whatsapp'), { wrapper });

    await waitFor(() => expect(result.current.statusError).toBe('Could not reach bridge'));
    // Status stays null, so the card offers Connect rather than an error state.
    expect(result.current.status).toBeNull();
    expect(result.current.isConnected).toBe(false);
  });

  it('never retries a failed status fetch', async () => {
    server.use(
      http.get('/api/bridge/:platform/status', () =>
        HttpResponse.json({ detail: 'nope' }, { status: 500 })
      )
    );

    const { result } = renderHook(() => useBridgeCard('whatsapp'), { wrapper });

    await waitFor(() => expect(result.current.statusError).toBeTruthy());
    expect(log.requests.filter((r) => r.path.includes('/status')).length).toBe(1);
  });

  it('disconnects and updates status locally without refetching', async () => {
    const { result } = renderHook(() => useBridgeCard('whatsapp'), { wrapper });
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    await act(async () => {
      result.current.disconnect();
    });

    await waitFor(() => expect(result.current.actionMessage).toBe('Disconnected successfully.'));
    expect(result.current.status).toBe('logged_out');
    expect(result.current.isConnected).toBe(false);

    // One status GET and one logout POST. No follow-up status request.
    expect(log.requests).toEqual([
      { method: 'GET', path: '/api/bridge/whatsapp/status' },
      { method: 'POST', path: '/api/bridge/whatsapp/logout' },
    ]);
  });

  it('surfaces the detail from a failed disconnect and leaves the status alone', async () => {
    const { result } = renderHook(() => useBridgeCard('whatsapp'), { wrapper });
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    server.use(
      http.post('/api/bridge/:platform/logout', () =>
        HttpResponse.json({ detail: 'Bridge bot unreachable' }, { status: 502 })
      )
    );

    await act(async () => {
      result.current.disconnect();
    });

    await waitFor(() => expect(result.current.actionError).toBe('Bridge bot unreachable'));
    expect(result.current.status).toBe('connected');
    expect(result.current.actionMessage).toBe('');
  });

  it('keeps each platform on its own request and its own state', async () => {
    const whatsapp = renderHook(() => useBridgeCard('whatsapp'), { wrapper });
    const linkedin = renderHook(() => useBridgeCard('linkedin'), { wrapper });

    await waitFor(() => expect(whatsapp.result.current.isChecking).toBe(false));
    await waitFor(() => expect(linkedin.result.current.isChecking).toBe(false));

    expect(whatsapp.result.current.status).toBe('connected');
    expect(linkedin.result.current.status).toBe('logged_out');
    expect(log.requests.map((r) => r.path)).toEqual([
      '/api/bridge/whatsapp/status',
      '/api/bridge/linkedin/status',
    ]);
  });
});
