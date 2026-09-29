import { buildApiError } from '@nexa/data';
import { describe, expect, it } from 'vitest';

describe('buildApiError (mobile shares web contract)', () => {
  it('prefers FastAPI detail string', () => {
    const err = buildApiError({ detail: 'Not authenticated' }, 401, 'Unauthorized');
    expect(err.message).toBe('Not authenticated');
    expect(err.status).toBe(401);
  });

  it('falls back to Request failed when detail is non-string', () => {
    const err = buildApiError({ detail: [{ msg: 'x' }] }, 422, 'Unprocessable');
    expect(err.message).toBe('Request failed');
    expect(err.status).toBe(422);
  });

  it('uses statusText when body is missing', () => {
    const err = buildApiError(undefined, 500, 'Internal Server Error');
    expect(err.message).toBe('Internal Server Error');
  });
});
