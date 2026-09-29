import { ONBOARD_STATUS } from '@nexa/contract';
import {
  DEFAULT_ONBOARD_USER_ID,
  extractApiError,
  onboardApi,
  onboardQrQueryOptions,
  onboardStatusQueryOptions,
} from '@nexa/data';
import { useToast } from '@nexa/shared-ui/hooks';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

export type OnboardPhase = 'idle' | 'scanning' | 'connected' | 'error';

/**
 * Controller for the WhatsApp onboarding screen, transcribed from `Onboard.tsx`.
 *
 * Behaviours that are preserved deliberately, each of which would be easy to "improve" into a
 * behavioural change:
 *
 * - The two polls are independent. Neither resets the other, so the QR can refresh mid-poll.
 * - Poll failures are swallowed and polling continues. No retry, no error surfaced.
 * - `DELETE /api/onboard/whatsapp/session/{id}` is sent when the session reaches `connected` and
 *   when the user hits Cancel, and NOT on unmount. Navigating away mid-scan leaves the session
 *   open on the sidecar. That is the current behaviour; changing it is DP-010.
 * - "Connect another" returns to idle and clears the QR but keeps `sessionId`, as before.
 * - The `status` field on the start response is ignored; only `qr` is read.
 */
export function useWhatsappOnboarding() {
  const toast = useToast();
  const [userId, setUserId] = useState('');
  const [phase, setPhase] = useState<OnboardPhase>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startQr, setStartQr] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isStarting, setStarting] = useState(false);

  // Polls run only while scanning. Passing null disables both queries, which is the React Query
  // equivalent of the legacy `clearInterval`.
  const pollSessionId = phase === 'scanning' ? sessionId : null;

  const statusQuery = useQuery(onboardStatusQueryOptions(pollSessionId));
  const qrQuery = useQuery(onboardQrQueryOptions(pollSessionId, startQr));

  const status = statusQuery.data?.status;
  // The refreshed QR wins once one arrives; until then it is the one from the start response.
  const qr = qrQuery.data?.qr ?? startQr;

  /**
   * Fire-and-forget session teardown. Errors ignored, matching `.catch(() => {})`.
   * Held in a ref so the status effect does not need it as a dependency.
   */
  const cancelSession = useRef((id: string) => {
    void onboardApi.cancelSession(id).catch(() => undefined);
  });

  useEffect(() => {
    if (phase !== 'scanning' || !status || !sessionId) return;

    if (status === ONBOARD_STATUS.connected) {
      setPhase('connected');
      toast.success('WhatsApp connected!');
      cancelSession.current(sessionId);
      return;
    }

    if (status === ONBOARD_STATUS.expired || status === ONBOARD_STATUS.notFound) {
      const message = `Session ${status} \u2014 please try again.`;
      setPhase('error');
      // Exact legacy copy, including the em dash.
      setError(message);
      toast.error(message);
    }
  }, [phase, sessionId, status, toast]);

  const start = useCallback(async () => {
    setError('');
    setPhase('scanning');
    setStartQr(null);
    setStarting(true);
    try {
      const result = await onboardApi.start(userId || DEFAULT_ONBOARD_USER_ID);
      setSessionId(result.session_id);
      if (result.qr) setStartQr(result.qr);
    } catch (err) {
      const message = extractApiError(err, 'Failed to start onboarding');
      setPhase('error');
      // Legacy fallback string for this screen.
      setError(message);
      toast.error(message);
    } finally {
      setStarting(false);
    }
  }, [toast, userId]);

  const cancel = useCallback(() => {
    if (sessionId) cancelSession.current(sessionId);
    setPhase('idle');
    setStartQr(null);
    setSessionId(null);
  }, [sessionId]);

  /** "Connect another": back to idle, QR cleared, session id intentionally retained. */
  const reset = useCallback(() => {
    setPhase('idle');
    setStartQr(null);
  }, []);

  const tryAgain = useCallback(() => setPhase('idle'), []);

  return {
    userId,
    setUserId,
    phase,
    qr,
    error,
    isStarting,
    start,
    cancel,
    reset,
    tryAgain,
  };
}
