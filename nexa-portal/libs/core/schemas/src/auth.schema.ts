import { z } from 'zod';

/**
 * These encode ONLY the validation the legacy form actually enforces.
 *
 * `Login.tsx` relies entirely on browser-native rules: `required` on Name, Email, and Password,
 * and `type="email"` on Email. There is no minimum password length, no strength rule, and no
 * phone format check. Adding any of those would reject input the current form accepts, which is
 * a behavioural change. Proposed separately as DP-011.
 */

const requiredText = (field: string) => z.string().trim().min(1, `${field} is required`);

export const LoginSchema = z.object({
  email: requiredText('Email').pipe(z.email('Enter a valid email address')),
  password: requiredText('Password'),
});

export const RegisterSchema = z.object({
  name: requiredText('Name'),
  email: requiredText('Email').pipe(z.email('Enter a valid email address')),
  password: requiredText('Password'),
  // Optional, with no format rule. The legacy input is a bare `type="tel"` with no pattern.
  phone: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
