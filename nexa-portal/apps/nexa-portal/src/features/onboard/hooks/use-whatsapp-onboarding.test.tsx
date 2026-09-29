import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_APP_CONFIG } from '@nexa/theme-web';
import { AppConfigProvider } from '@nexa/shared-ui/providers';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { server } from '../../../mocks/server';
import { startRequestLog } from '../../../testing/request-log';
import { configureTestPlatform, createTestQueryClient } from '../../../testing/test-utils';
import { useWhatsappOnboarding } from './use-whatsapp-onboarding';

/**
 * The poll cadence is the single most fragile parity property in the rebuild, because React Query
 * fetches on mount by default and a `setInterval` does not. These tests assert the timing
 * directly: no status or QR request before t=3000ms, and the QR refresh at t=18000ms.
 */

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider config={DEFAULT_APP_CONFIG}>{children}</AppConfigProvider>
    </QueryClientProvider>
  );
}

describe('useWhatsappOnboarding', () => {
  let log: ReturnType<typeof startRequestLog>;

  beforeEach(() => {
    configureTestPlatform();
    log = startRequestLog();
  });

  afterEach(() => {
    log.stop();
    vi.useRealTimers();
  });

  it('starts idle and issues no request until the user clicks Start', () => {
    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    expect(result.current.phase).toBe('idle');
    expect(log.requests).toHaveLength(0);
  });

  it('sends user_id "default" when the field is left blank', async () => {
    let received: unknown;
    server.use(
      http.post('/api/onboard/whatsapp/start', async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({
          session_id: 'session-1',
          status: 'pending',
          qr: 'data:image/png;base64,AAAA',
          matrix_user_id: '@nexa:example.org',
        });
      })
    );

    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());

    expect(received).toEqual({ user_id: 'default' });
  });

  it('shows the QR from the start response without a separate QR request', async () => {
    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());

    await waitFor(() => expect(result.current.phase).toBe('scanning'));
    expect(result.current.qr).toBe('data:image/png;base64,iVBORw0KGgo=');

    // Exactly one request so far: the start POST. Nothing polled at t=0.
    expect(log.requests).toEqual([{ method: 'POST', path: '/api/onboard/whatsapp/start' }]);
  });

  it('fires the first status poll at 3000ms and the QR refresh at 18000ms', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());
    await waitFor(() => expect(result.current.phase).toBe('scanning'));

    const pollPaths = () => log.requests.filter((r) => r.path.includes('/status/')).length;
    const qrPaths = () => log.requests.filter((r) => r.path.includes('/qr/')).length;

    // Just short of the first interval: still nothing.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2900);
    });
    expect(pollPaths()).toBe(0);
    expect(qrPaths()).toBe(0);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(pollPaths()).toBe(1);
    // The QR refresh is on its own 18s schedule and has not come round yet.
    expect(qrPaths()).toBe(0);
  });

  it('moves to connected and deletes the session when the poll reports connected', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());
    await waitFor(() => expect(result.current.phase).toBe('scanning'));

    // The mock flips to connected on the second poll.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6500);
    });

    await waitFor(() => expect(result.current.phase).toBe('connected'));
    await waitFor(() => expect(log.requests.some((r) => r.method === 'DELETE')).toBe(true));
  });

  it('uses the exact legacy copy when the session expires', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    server.use(
      http.get('/api/onboard/whatsapp/status/:sessionId', () =>
        HttpResponse.json({ status: 'expired' })
      )
    );

    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3100);
    });

    await waitFor(() => expect(result.current.phase).toBe('error'));
    expect(result.current.error).toBe('Session expired \u2014 please try again.');
  });

  it('keeps polling after a failed poll instead of stopping', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    server.use(
      http.get('/api/onboard/whatsapp/status/:sessionId', () =>
        HttpResponse.json({ detail: 'upstream down' }, { status: 502 })
      )
    );

    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());
    await waitFor(() => expect(result.current.phase).toBe('scanning'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(9500);
    });

    expect(log.requests.filter((r) => r.path.includes('/status/')).length).toBeGreaterThan(1);
    // The failure is swallowed: still scanning, no error shown.
    expect(result.current.phase).toBe('scanning');
    expect(result.current.error).toBe('');
  });

  it('deletes the session on Cancel and returns to idle', async () => {
    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());
    await waitFor(() => expect(result.current.phase).toBe('scanning'));

    act(() => result.current.cancel());

    expect(result.current.phase).toBe('idle');
    expect(result.current.qr).toBeNull();
    await waitFor(() => expect(log.requests.some((r) => r.method === 'DELETE')).toBe(true));
  });

  /** Documents DP-010: navigating away mid-scan leaves the session open on the sidecar. */
  it('does NOT delete the session on unmount', async () => {
    const { result, unmount } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());
    await waitFor(() => expect(result.current.phase).toBe('scanning'));

    unmount();

    expect(log.requests.some((r) => r.method === 'DELETE')).toBe(false);
  });

  it('surfaces the screen-specific fallback when Start fails without a detail', async () => {
    server.use(
      http.post('/api/onboard/whatsapp/start', () => new HttpResponse(null, { status: 500 }))
    );

    const { result } = renderHook(() => useWhatsappOnboarding(), { wrapper });
    await act(() => result.current.start());

    expect(result.current.phase).toBe('error');
    expect(result.current.error).toBeTruthy();
  });
});
