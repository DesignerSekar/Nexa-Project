import { getAuthStrategy } from '@nexa/auth';
import { buildApiError, type HttpClient, type RequestConfig } from '@nexa/data';
import { env } from './env';
import { emitUnauthorized, isAuthProbePath } from './unauthorized-bridge';

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

async function request<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
  config?: RequestConfig
): Promise<T> {
  const strategy = getAuthStrategy();
  const attached = await strategy.attach(config ?? {});
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...attached.headers,
  };

  const response = await fetch(`${env.EXPO_PUBLIC_API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: attached.signal as AbortSignal | undefined,
  });

  if (!response.ok) {
    if (response.status === 401 && !isAuthProbePath(path)) {
      emitUnauthorized();
    }
    const parsed = await parseBody(response);
    throw buildApiError(parsed, response.status, response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Mobile `HttpClient`. Always runs `AuthStrategy.attach` so Bearer tokens are sent.
 * Error shape matches web via `buildApiError`.
 */
export const mobileHttpClient: HttpClient = {
  get: (path, config) => request('GET', path, undefined, config),
  post: (path, body, config) => request('POST', path, body, config),
  del: (path, config) => request('DELETE', path, undefined, config),
};
