import type { BridgePlatform, OAuthProvider } from './types';

/**
 * Every path the portal is allowed to call, and nothing else.
 *
 * Adding an entry here means adding backend traffic, which the migration constraint forbids.
 * See docs/api-contract.md for the endpoints the sidecar exposes that deliberately do not appear
 * in this file.
 */
export const endpoints = {
  auth: {
    register: '/api/auth/register',
    login: '/api/auth/login',
    me: '/api/auth/me',
    logout: '/api/auth/logout',
    /** Not fetched. Used as a full-page navigation target. */
    oauthStart: (provider: OAuthProvider) => `/api/auth/oauth/${provider}/start`,
  },
  onboard: {
    whatsappStart: '/api/onboard/whatsapp/start',
    whatsappStatus: (sessionId: string) => `/api/onboard/whatsapp/status/${sessionId}`,
    whatsappQr: (sessionId: string) => `/api/onboard/whatsapp/qr/${sessionId}`,
    whatsappSession: (sessionId: string) => `/api/onboard/whatsapp/session/${sessionId}`,
  },
  bridge: {
    status: (platform: BridgePlatform) => `/api/bridge/${platform}/status`,
    logout: (platform: BridgePlatform) => `/api/bridge/${platform}/logout`,
  },
  stats: '/api/stats',
  recentMessages: (limit: number) => `/api/messages/recent?limit=${limit}`,
  /** Defined in the legacy client, never called by a screen. Kept so the contract is complete. */
  health: '/health',
} as const;

/**
 * The Dashboard calls `recentMessages` with 10, not the legacy helper's default of 20.
 * The live request is what parity is measured against.
 */
export const DASHBOARD_RECENT_MESSAGES_LIMIT = 10;
