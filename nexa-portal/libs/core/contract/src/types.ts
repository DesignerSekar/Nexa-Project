/**
 * Request and response types for the Nexa sidecar.
 *
 * Transcribed from the legacy client (`Nexa-FrontEnd-main/src/api.ts`) and cross-checked against
 * `nexa-beeper-connector-main/sidecar/main.py`. This is the frozen contract: see
 * docs/api-contract.md. Payload fields stay snake_case because that is what the wire uses.
 */

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
}

export interface Stats {
  total_messages: number;
  pending_actions: number;
  priority_breakdown: Record<string, number>;
  /** Returned by the sidecar but not rendered by any screen. See DP-004. */
  classifier_breakdown: Record<string, number>;
  classifier: string;
}

export interface Message {
  id: string;
  platform: string;
  sender: string;
  content: string;
  /** Epoch seconds. Not rendered by any screen today. See DP-005. */
  timestamp: number;
  classification: string | null;
  /** Not rendered by any screen today. See DP-005. */
  confidence: number | null;
}

export interface OnboardResult {
  session_id: string;
  status: string;
  qr: string | null;
  /** Not rendered by any screen today. */
  matrix_user_id: string;
}

/**
 * Auth travels as the HttpOnly `nexa_session` cookie on web. After DP-009 the same session
 * primary key is also returned as `token` for mobile Bearer clients. Web ignores `token`.
 */
export interface AuthResponse {
  success: boolean;
  user: User;
  /** Session token (auth_sessions PK). Present after DP-009; optional for older sidecars. */
  token?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

export interface LogoutResponse {
  success: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  /** Omitted entirely when the field is blank, matching the legacy client. */
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OnboardStartRequest {
  user_id: string;
}

export interface OnboardStatusResponse {
  status: string;
}

export interface OnboardQrResponse {
  qr: string | null;
  status: string;
}

export interface BridgeStatusResponse {
  status: string;
  /** Returned by the sidecar but not rendered. */
  bridge_bot: string;
}

export interface BridgeLogoutResponse {
  status: string;
}

export interface RecentMessagesResponse {
  messages: Message[];
  /** Returned by the sidecar but not rendered. */
  count: number;
}

export interface HealthResponse {
  status: string;
}

export type OAuthProvider = 'google' | 'github';

/**
 * The sidecar accepts all four. The web UI only ever sends `whatsapp` and `linkedin`, because only
 * those two cards are mounted. Mounting the other two would be new traffic: see DP-002.
 */
export type BridgePlatform = 'whatsapp' | 'linkedin' | 'instagram' | 'twitter';

/** The bridge platforms the portal actually talks to. Do not widen without accepting DP-002. */
export const MOUNTED_BRIDGE_PLATFORMS = ['whatsapp', 'linkedin'] as const;

export type MountedBridgePlatform = (typeof MOUNTED_BRIDGE_PLATFORMS)[number];

/** Onboarding statuses the legacy screen branches on. Anything else means "keep polling". */
export const ONBOARD_STATUS = {
  connected: 'connected',
  expired: 'expired',
  notFound: 'not_found',
} as const;

/** Bridge statuses the legacy screen gives a distinct colour to. */
export const BRIDGE_STATUS = {
  connected: 'connected',
  loggedOut: 'logged_out',
  disconnected: 'disconnected',
} as const;
