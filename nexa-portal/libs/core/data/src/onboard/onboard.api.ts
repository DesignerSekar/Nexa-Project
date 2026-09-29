import {
  endpoints,
  type OnboardQrResponse,
  type OnboardResult,
  type OnboardStartRequest,
  type OnboardStatusResponse,
} from '@nexa/contract';
import { getHttpClient } from '../http/http-client';

/** The legacy screen sends this when the User ID field is left blank. */
export const DEFAULT_ONBOARD_USER_ID = 'default';

export const onboardApi = {
  start(userId: string): Promise<OnboardResult> {
    const body: OnboardStartRequest = { user_id: userId || DEFAULT_ONBOARD_USER_ID };
    return getHttpClient().post<OnboardResult>(endpoints.onboard.whatsappStart, body);
  },

  status(sessionId: string): Promise<OnboardStatusResponse> {
    return getHttpClient().get<OnboardStatusResponse>(endpoints.onboard.whatsappStatus(sessionId));
  },

  qr(sessionId: string): Promise<OnboardQrResponse> {
    return getHttpClient().get<OnboardQrResponse>(endpoints.onboard.whatsappQr(sessionId));
  },

  /**
   * Called when the session reaches `connected` and when the user cancels.
   * Deliberately NOT called on unmount — see docs/screen-inventory.md.
   */
  cancelSession(sessionId: string): Promise<OnboardStatusResponse> {
    return getHttpClient().del<OnboardStatusResponse>(endpoints.onboard.whatsappSession(sessionId));
  },
};
