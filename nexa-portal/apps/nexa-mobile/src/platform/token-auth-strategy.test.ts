import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => {
  const map = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => map.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        map.set(key, value);
      }),
      removeItem: vi.fn(async (key: string) => {
        map.delete(key);
      }),
      __map: map,
    },
  };
});

import { __setMemoryTokenForTests, tokenAuthStrategy } from './token-auth-strategy';

describe('tokenAuthStrategy', () => {
  beforeEach(() => {
    __setMemoryTokenForTests(null);
  });

  it('persists token on auth success and attaches Bearer header', async () => {
    await tokenAuthStrategy.onAuthSuccess({
      success: true,
      user: { id: 1, name: 'Ada', email: 'ada@example.com' },
      token: 'sess-abc',
    });

    const attached = await tokenAuthStrategy.attach({ headers: { 'X-Test': '1' } });
    expect(attached.headers?.Authorization).toBe('Bearer sess-abc');
    expect(attached.headers?.['X-Test']).toBe('1');
  });

  it('clears token so attach becomes a no-op', async () => {
    await tokenAuthStrategy.onAuthSuccess({
      success: true,
      user: { id: 1, name: 'Ada', email: 'ada@example.com' },
      token: 'sess-abc',
    });
    await tokenAuthStrategy.clear();

    const attached = await tokenAuthStrategy.attach({});
    expect(attached.headers?.Authorization).toBeUndefined();
  });

  it('does not attach when no token is stored', async () => {
    const attached = await tokenAuthStrategy.attach({ headers: {} });
    expect(attached.headers?.Authorization).toBeUndefined();
  });
});
