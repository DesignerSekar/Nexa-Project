import { getAuthStrategy, useAuthStore } from '@nexa/auth';
import type { OAuthProvider } from '@nexa/contract';
import { authApi, extractApiError } from '@nexa/data';
import { startOAuthRedirect } from '@nexa/platform-web';
import {
  LoginSchema,
  RegisterSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '@nexa/schemas';
import { useToast } from '@nexa/shared-ui/hooks';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

export type AuthTab = 'login' | 'register';

/**
 * Controller for the login screen. All of its behaviour is transcribed from `Login.tsx`:
 *
 * - one shared `error` string, cleared on submit and on tab switch
 * - `res.success && res.user` is the success condition; anything else leaves the form as-is with
 *   no error, which is the legacy behaviour and not an oversight to fix here
 * - `phone || undefined` so a blank phone is omitted from the request body
 */
export function useLoginForm() {
  const [tab, setTab] = useState<AuthTab>('login');
  const [error, setError] = useState('');
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const toast = useToast();
  const { redirect } = useSearch({ from: '/public/login' });

  const loginForm = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: standardSchemaResolver(RegisterSchema),
    defaultValues: { name: '', email: '', password: '', phone: '' },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues | RegisterFormValues) =>
      'name' in values
        ? authApi.register({
            name: values.name,
            email: values.email,
            password: values.password,
            phone: values.phone || undefined,
          })
        : authApi.login(values),
    onSuccess: async (response) => {
      if (response.success && response.user) {
        await getAuthStrategy().onAuthSuccess(response);
        setUser(response.user);
        toast.success('Signed in successfully');
        await navigate({ to: redirect ?? '/app/dashboard', replace: true });
      }
    },
    // Submit errors stay inline; 'Something went wrong' is the legacy fallback.
    onError: (err) => setError(extractApiError(err, 'Something went wrong')),
  });

  const selectTab = useCallback((next: AuthTab) => {
    setTab(next);
    setError('');
  }, []);

  const submit = useCallback(() => {
    setError('');
    return tab === 'login'
      ? loginForm.handleSubmit((values) => mutation.mutateAsync(values).catch(() => undefined))()
      : registerForm.handleSubmit((values) =>
          mutation.mutateAsync(values).catch(() => undefined)
        )();
  }, [loginForm, mutation, registerForm, tab]);

  /** A full-page navigation, not an XHR. Same target URL as the legacy client. */
  const startOAuth = useCallback((provider: OAuthProvider) => {
    startOAuthRedirect(provider);
  }, []);

  return {
    tab,
    selectTab,
    error,
    submit,
    startOAuth,
    loginForm,
    registerForm,
    isSubmitting: mutation.isPending,
  };
}
