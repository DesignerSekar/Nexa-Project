import { describe, expect, it } from 'vitest';
import { queryClient } from './query-client';
import { onboardQrQueryOptions, onboardStatusQueryOptions } from './onboard/onboard.queries';
import { statsQueryOptions } from './dashboard/dashboard.queries';
import { bridgeStatusQueryOptions } from './bridges/bridges.queries';
import { ONBOARD_QR_REFRESH_MS, ONBOARD_STATUS_POLL_MS } from './parity';

/**
 * Guards the values the Phase 9 network diff depends on. Every assertion here corresponds to a
 * line in docs/screen-inventory.md, and breaking one means the rebuilt UI issues different
 * traffic from the legacy app.
 */

describe('poll cadences', () => {
  it('matches the legacy setInterval values exactly', () => {
    expect(ONBOARD_STATUS_POLL_MS).toBe(3000);
    expect(ONBOARD_QR_REFRESH_MS).toBe(18000);
  });

  it('schedules the status poll at 3000ms and seeds initial data so nothing fires at t=0', () => {
    const options = onboardStatusQueryOptions('session-1');
    expect(options.refetchInterval).toBe(3000);
    expect(options.initialData).toBeDefined();
    // Marking the seed permanently fresh is what suppresses the fetch when the query is enabled.
    expect(options.staleTime).toBe(Infinity);
    expect(options.refetchOnMount).toBe(false);
  });

  it('seeds the QR query from the start response rather than fetching immediately', () => {
    const options = onboardQrQueryOptions('session-1', 'data:image/png;base64,AAAA');
    expect(options.refetchInterval).toBe(18000);
    expect(options.staleTime).toBe(Infinity);
    expect(options.refetchOnMount).toBe(false);
    expect(options.initialData).toEqual({
      qr: 'data:image/png;base64,AAAA',
      status: expect.any(String),
    });
  });

  it('never retries a failed poll, so a transient error does not stop the schedule', () => {
    expect(onboardStatusQueryOptions('session-1').retry).toBe(false);
    expect(onboardQrQueryOptions('session-1', null).retry).toBe(false);
  });

  it('does not poll a backgrounded tab', () => {
    expect(onboardStatusQueryOptions('session-1').refetchIntervalInBackground).toBe(false);
  });

  it('disables both polls when there is no session', () => {
    expect(onboardStatusQueryOptions(null).enabled).toBe(false);
    expect(onboardQrQueryOptions(null, null).enabled).toBe(false);
  });
});

describe('mount-effect queries', () => {
  it('refetch on every mount and never retry, matching a []-dependency useEffect', () => {
    for (const options of [statsQueryOptions(), bridgeStatusQueryOptions('whatsapp')]) {
      expect(options.retry).toBe(false);
      expect(options.staleTime).toBe(0);
      expect(options.refetchOnMount).toBe('always');
      expect(options.refetchOnWindowFocus).toBe(false);
      expect(options.refetchOnReconnect).toBe(false);
    }
  });
});

describe('query client defaults', () => {
  it('does not refetch on window focus, which the legacy app never did', () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
  });

  it('does not retry mutations', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(0);
  });
});
