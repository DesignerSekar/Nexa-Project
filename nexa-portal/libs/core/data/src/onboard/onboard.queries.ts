import type { OnboardQrResponse, OnboardStatusResponse } from '@nexa/contract';
import { queryOptions } from '@tanstack/react-query';
import {
  ONBOARD_QR_REFRESH_MS,
  ONBOARD_STATUS_NOT_YET_POLLED,
  ONBOARD_STATUS_POLL_MS,
  pollParity,
} from '../parity';
import { onboardApi } from './onboard.api';
import { onboardKeys } from './onboard.keys';

/**
 * Status poll, every 3000 ms.
 *
 * `refetchInterval` is a constant rather than a callback, so a rejected poll does not stop the
 * schedule. Paired with `retry: false`, that reproduces the legacy `setInterval` whose `catch`
 * block is an empty comment.
 *
 * `initialData` plus `refetchOnMount: false` (from `pollParity`) is what puts the first request at
 * t=3000ms instead of t=0, matching `setInterval`. See `ONBOARD_STATUS_NOT_YET_POLLED`.
 */
export function onboardStatusQueryOptions(sessionId: string | null) {
  return queryOptions({
    queryKey: onboardKeys.status(sessionId ?? ''),
    queryFn: () => onboardApi.status(sessionId as string),
    enabled: Boolean(sessionId),
    initialData: { status: ONBOARD_STATUS_NOT_YET_POLLED } satisfies OnboardStatusResponse,
    refetchInterval: ONBOARD_STATUS_POLL_MS,
    refetchIntervalInBackground: false,
    ...pollParity,
  });
}

/**
 * QR refresh, every 18000 ms. Independent of the status poll; neither resets the other.
 *
 * Seeded with the QR from the `start` response, because that is where the legacy screen gets the
 * first image (`if (res.qr) setQr(res.qr)`). The refresh interval then supplies later ones, so no
 * QR request is made at t=0.
 */
export function onboardQrQueryOptions(sessionId: string | null, initialQr: string | null) {
  return queryOptions({
    queryKey: onboardKeys.qr(sessionId ?? ''),
    queryFn: () => onboardApi.qr(sessionId as string),
    enabled: Boolean(sessionId),
    initialData: {
      qr: initialQr,
      status: ONBOARD_STATUS_NOT_YET_POLLED,
    } satisfies OnboardQrResponse,
    refetchInterval: ONBOARD_QR_REFRESH_MS,
    refetchIntervalInBackground: false,
    ...pollParity,
  });
}
