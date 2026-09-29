import { ONBOARD_STATUS } from '@nexa/contract';
import {
  DEFAULT_ONBOARD_USER_ID,
  extractApiError,
  onboardApi,
  onboardQrQueryOptions,
  onboardStatusQueryOptions,
} from '@nexa/data';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSnackbar } from '../../app/snackbar';

export type OnboardPhase = 'idle' | 'scanning' | 'connected' | 'error';

/** Parity with web `useWhatsappOnboarding` (poll cadences, DELETE rules, connect-another quirk). */
export function useWhatsappOnboarding() {
  const snackbar = useSnackbar();
  const [userId, setUserId] = useState('');
  const [phase, setPhase] = useState<OnboardPhase>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startQr, setStartQr] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isStarting, setStarting] = useState(false);

  const pollSessionId = phase === 'scanning' ? sessionId : null;

  const statusQuery = useQuery(onboardStatusQueryOptions(pollSessionId));
  const qrQuery = useQuery(onboardQrQueryOptions(pollSessionId, startQr));

  const status = statusQuery.data?.status;
  const qr = qrQuery.data?.qr ?? startQr;

  const cancelSession = useRef((id: string) => {
    void onboardApi.cancelSession(id).catch(() => undefined);
  });

  useEffect(() => {
    if (phase !== 'scanning' || !status || !sessionId) return;

    if (status === ONBOARD_STATUS.connected) {
      setPhase('connected');
      snackbar.success('WhatsApp connected!');
      cancelSession.current(sessionId);
      return;
    }

    if (status === ONBOARD_STATUS.expired || status === ONBOARD_STATUS.notFound) {
      const message = `Session ${status} \u2014 please try again.`;
      setPhase('error');
      setError(message);
      snackbar.error(message);
    }
  }, [phase, sessionId, status, snackbar]);

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
      setError(message);
      snackbar.error(message);
    } finally {
      setStarting(false);
    }
  }, [snackbar, userId]);

  const cancel = useCallback(() => {
    if (sessionId) cancelSession.current(sessionId);
    setPhase('idle');
    setStartQr(null);
    setSessionId(null);
  }, [sessionId]);

  /** Connect another: idle + clear QR; keep session id (web parity). */
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
