import { describe, expect, it } from 'vitest';
import {
  ApiError,
  buildApiError,
  extractApiError,
  FALLBACK_ERROR_MESSAGE,
  isUnauthorized,
} from './errors';

/**
 * The legacy client's error path, asserted line for line:
 *
 *   const err = await res.json().catch(() => ({ detail: res.statusText }))
 *   throw Object.assign(new Error(err.detail ?? 'Request failed'), { status: res.status })
 *
 * The message the user sees on a failed login or a failed disconnect comes straight out of here,
 * so a change is user-visible.
 */

describe('buildApiError', () => {
  it('prefers the FastAPI detail string', () => {
    const error = buildApiError({ detail: 'Invalid credentials' }, 401, 'Unauthorized');
    expect(error.message).toBe('Invalid credentials');
    expect(error.status).toBe(401);
  });

  it('falls back to the status text when the body was not JSON', () => {
    expect(buildApiError(undefined, 502, 'Bad Gateway').message).toBe('Bad Gateway');
  });

  it('falls back to Request failed when the body parsed but carried no detail', () => {
    expect(buildApiError({}, 500, 'Internal Server Error').message).toBe(FALLBACK_ERROR_MESSAGE);
  });

  it('does not render [object Object] for a FastAPI validation error array', () => {
    const error = buildApiError({ detail: [{ msg: 'field required' }] }, 422, 'Unprocessable');
    expect(error.message).toBe(FALLBACK_ERROR_MESSAGE);
  });
});

describe('extractApiError', () => {
  it('uses the error message when there is one', () => {
    expect(extractApiError(new Error('Logout failed'), 'fallback')).toBe('Logout failed');
  });

  it('uses the screen-specific fallback for a non-Error rejection', () => {
    expect(extractApiError('boom', 'Something went wrong')).toBe('Something went wrong');
    expect(extractApiError(new Error(''), 'Something went wrong')).toBe('Something went wrong');
  });
});

describe('isUnauthorized', () => {
  it('is true only for a 401 ApiError', () => {
    expect(isUnauthorized(new ApiError('nope', 401))).toBe(true);
    expect(isUnauthorized(new ApiError('nope', 403))).toBe(false);
    expect(isUnauthorized(new Error('nope'))).toBe(false);
  });
});
