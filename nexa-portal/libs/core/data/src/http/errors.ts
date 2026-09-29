/**
 * The sidecar is FastAPI, so errors arrive as `{ detail: string }` — not the
 * `{ status, data, error: { message } }` envelope the ecom-v2 client expects.
 *
 * The legacy client's behaviour, reproduced exactly:
 *
 *   const err = await res.json().catch(() => ({ detail: res.statusText }))
 *   throw Object.assign(new Error(err.detail ?? 'Request failed'), { status: res.status })
 *
 * So the message precedence is: `detail` from the JSON body, then the literal 'Request failed'
 * when the body parsed but carried no `detail`, then the status text when the body was not JSON.
 */

export const FALLBACK_ERROR_MESSAGE = 'Request failed';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface FastApiErrorBody {
  detail?: unknown;
}

/**
 * Builds the error a failed response should throw.
 *
 * @param body   parsed JSON body, or undefined when the body was not JSON
 * @param status HTTP status code
 * @param statusText used only when the body was not JSON at all
 */
export function buildApiError(body: unknown, status: number, statusText: string): ApiError {
  if (body === undefined || body === null) {
    return new ApiError(statusText || FALLBACK_ERROR_MESSAGE, status);
  }

  const detail = (body as FastApiErrorBody).detail;

  if (typeof detail === 'string' && detail.length > 0) {
    return new ApiError(detail, status);
  }

  // FastAPI validation errors put an array of issues in `detail`. The legacy client would have
  // rendered "[object Object]" here; surfacing the fallback instead is strictly a display detail
  // and issues no different request.
  if (detail !== undefined && detail !== null) {
    return new ApiError(FALLBACK_ERROR_MESSAGE, status);
  }

  return new ApiError(FALLBACK_ERROR_MESSAGE, status);
}

/**
 * Pulls a user-facing string out of whatever a mutation rejected with.
 *
 * Mirrors the legacy pages, which each did:
 *   err instanceof Error ? err.message : '<screen specific fallback>'
 */
export function extractApiError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
