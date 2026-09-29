import {
  endpoints,
  type AuthResponse,
  type LoginRequest,
  type LogoutResponse,
  type RegisterRequest,
  type SessionResponse,
} from '@nexa/contract';
import { getHttpClient } from '../http/http-client';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export const authApi = {
  /**
   * `phone` is omitted from the body entirely when blank, matching the legacy client's
   * `phone: phone || undefined`. Sending `phone: null` or `phone: ''` would be a different request.
   */
  register({ name, email, password, phone }: RegisterInput): Promise<AuthResponse> {
    const body: RegisterRequest = { name, email, password };
    if (phone) {
      body.phone = phone;
    }
    return getHttpClient().post<AuthResponse>(endpoints.auth.register, body);
  },

  login(input: LoginRequest): Promise<AuthResponse> {
    return getHttpClient().post<AuthResponse>(endpoints.auth.login, input);
  },

  me(): Promise<SessionResponse> {
    return getHttpClient().get<SessionResponse>(endpoints.auth.me);
  },

  logout(): Promise<LogoutResponse> {
    return getHttpClient().post<LogoutResponse>(endpoints.auth.logout);
  },
};
