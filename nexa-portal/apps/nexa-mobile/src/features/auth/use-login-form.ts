import { getAuthStrategy, useAuthStore } from '@nexa/auth';
import { authApi, extractApiError } from '@nexa/data';
import { LoginSchema, RegisterSchema } from '@nexa/schemas';
import { useCallback, useState } from 'react';
import { useSnackbar } from '../../app/snackbar';

export type AuthTab = 'login' | 'register';

/**
 * Auth screen controller — same success rules as web `useLoginForm` without react-hook-form
 * (Paper TextInputs + Zod parse on submit).
 */
export function useLoginForm() {
  const [tab, setTab] = useState<AuthTab>('login');
  const [error, setError] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const setUser = useAuthStore((s) => s.setUser);
  const snackbar = useSnackbar();

  const selectTab = useCallback((next: AuthTab) => {
    setTab(next);
    setError('');
  }, []);

  const submit = useCallback(async () => {
    setError('');
    setSubmitting(true);
    try {
      if (tab === 'login') {
        const parsed = LoginSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        const response = await authApi.login(parsed.data);
        if (response.success && response.user) {
          await getAuthStrategy().onAuthSuccess(response);
          setUser(response.user);
          snackbar.success('Signed in successfully');
        }
      } else {
        const parsed = RegisterSchema.safeParse({ name, email, password, phone });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? 'Invalid input');
          return;
        }
        const response = await authApi.register({
          name: parsed.data.name,
          email: parsed.data.email,
          password: parsed.data.password,
          phone: parsed.data.phone || undefined,
        });
        if (response.success && response.user) {
          await getAuthStrategy().onAuthSuccess(response);
          setUser(response.user);
          snackbar.success('Signed in successfully');
        }
      }
    } catch (err) {
      setError(extractApiError(err, 'Something went wrong'));
    } finally {
      setSubmitting(false);
    }
  }, [email, name, password, phone, setUser, snackbar, tab]);

  return {
    tab,
    selectTab,
    error,
    submit,
    isSubmitting,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    phone,
    setPhone,
  };
}
