import { buildApiError, type HttpClient, type RequestConfig } from '@nexa/data';
import axios, { type AxiosError, type AxiosInstance } from 'axios';
import { env } from './env';
import { emitUnauthorized, isAuthProbePath } from './unauthorized-bridge';

/**
 * The web `HttpClient`.
 *
 * Two deliberate differences from ecom-v2's `api-client.ts`, both forced by the contract:
 *
 * 1. `withCredentials: true` and NO `Authorization` header. Nexa's session is an HttpOnly cookie
 *    the browser sends automatically; ecom-v2 reads a bearer token out of localStorage.
 * 2. Errors are rebuilt from FastAPI's `{ detail }` rather than ecom-v2's nested envelope.
 */
function createAxiosInstance(): AxiosInstance {
  const instance = axios.create({
    baseURL: env.VITE_API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401 && !isAuthProbePath(error.config?.url)) {
        emitUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const axiosInstance = createAxiosInstance();

function toApiError(error: unknown): never {
  if (axios.isAxiosError(error) && error.response) {
    throw buildApiError(error.response.data, error.response.status, error.response.statusText);
  }
  // Network failure, timeout, or cancellation: no response to read a `detail` from.
  throw error instanceof Error ? error : new Error('Request failed');
}

export const webHttpClient: HttpClient = {
  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.get<T>(path, config);
      return response.data;
    } catch (error) {
      return toApiError(error);
    }
  },

  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.post<T>(path, body, config);
      return response.data;
    } catch (error) {
      return toApiError(error);
    }
  },

  async del<T>(path: string, config?: RequestConfig): Promise<T> {
    try {
      const response = await axiosInstance.delete<T>(path, config);
      return response.data;
    } catch (error) {
      return toApiError(error);
    }
  },
};
