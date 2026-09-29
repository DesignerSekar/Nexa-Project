import type { AuthStrategy } from '@nexa/auth';
import type { AuthResponse } from '@nexa/contract';
import type { RequestConfig } from '@nexa/data';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SESSION_TOKEN_KEY = 'nexa.session.token';

let memoryToken: string | null = null;

async function readToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  memoryToken = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
  return memoryToken;
}

async function writeToken(token: string): Promise<void> {
  memoryToken = token;
  await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
}

async function dropToken(): Promise<void> {
  memoryToken = null;
  await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * Bearer session transport (DP-009).
 *
 * Persists `AuthResponse.token` and injects `Authorization: Bearer …` on every request via
 * `attach`. The fetch HttpClient must call `attach` before sending.
 */
export const tokenAuthStrategy: AuthStrategy = {
  kind: 'token',

  async attach(config: RequestConfig): Promise<RequestConfig> {
    const token = await readToken();
    if (!token) return config;
    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };
  },

  async onAuthSuccess(response: AuthResponse): Promise<void> {
    if (response.token) {
      await writeToken(response.token);
    }
  },

  async clear(): Promise<void> {
    await dropToken();
  },
};

/** Test helper: seed / inspect the in-memory cache without touching AsyncStorage. */
export function __setMemoryTokenForTests(token: string | null): void {
  memoryToken = token;
}
