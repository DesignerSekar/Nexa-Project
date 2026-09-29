import { describe, expect, it } from 'vitest';
import { LoginSchema, RegisterSchema } from './auth.schema';

/**
 * The point of these tests is the negative space: they assert the schemas do NOT enforce rules the
 * legacy form allowed through. A password minimum or a phone pattern would reject input the
 * current app accepts, which is a behavioural change (DP-011).
 */

describe('LoginSchema', () => {
  it('accepts any non-empty password, with no length or strength rule', () => {
    expect(LoginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });

  it('rejects a blank email or password, matching the native required attributes', () => {
    expect(LoginSchema.safeParse({ email: '', password: 'secret' }).success).toBe(false);
    expect(LoginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });

  it('rejects a malformed email, matching type="email"', () => {
    expect(LoginSchema.safeParse({ email: 'not-an-email', password: 'secret' }).success).toBe(
      false
    );
  });

  it('treats a whitespace-only value as blank', () => {
    expect(LoginSchema.safeParse({ email: '   ', password: 'secret' }).success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  const valid = { name: 'Jane Doe', email: 'jane@example.com', password: 'pw' };

  it('accepts a submission with no phone at all', () => {
    expect(RegisterSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts a blank phone, which the client then omits from the request body', () => {
    expect(RegisterSchema.safeParse({ ...valid, phone: '' }).success).toBe(true);
  });

  it('applies no format rule to the phone', () => {
    for (const phone of ['+1 555 000 0000', '5550000', 'not a number at all']) {
      expect(RegisterSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
  });

  it('requires a name', () => {
    expect(RegisterSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });
});
