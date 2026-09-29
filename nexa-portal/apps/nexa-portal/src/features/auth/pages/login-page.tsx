import { AppButton, AppTabs, FormInput } from '@nexa/shared-ui';
import { Card, Divider, Typography } from 'antd';
import { OAuthButtons } from '../components/oauth-buttons';
import { useLoginForm } from '../hooks/use-login-form';

const { Title, Text } = Typography;

/** Eight bullets, as in the legacy markup. */
const PASSWORD_PLACEHOLDER = '\u2022'.repeat(8);

/**
 * Login and registration.
 *
 * Form-first layout: brand → tabs → email/password form → divider → OAuth.
 * Register field order is Name, Email, Password, then optional Mobile.
 */
export function LoginPage() {
  const { tab, selectTab, error, submit, startOAuth, loginForm, registerForm, isSubmitting } =
    useLoginForm();

  const submitLabel = isSubmitting
    ? 'Please wait\u2026'
    : tab === 'login'
      ? 'Sign in'
      : 'Create account';

  return (
    <Card styles={{ body: { padding: '20px 22px' } }}>
      <div className="mb-3 text-center">
        <Title level={3} className="!mb-1 !mt-0">
          Nexa
        </Title>
        <Text type="secondary" className="text-sm leading-snug">
          AI message routing for WhatsApp, LinkedIn, Instagram &amp; X
        </Text>
      </div>

      <AppTabs
        size="small"
        activeKey={tab}
        onChange={(key) => selectTab(key as 'login' | 'register')}
        items={[
          { key: 'login', label: 'Sign in' },
          { key: 'register', label: 'Create account' },
        ]}
      />

      <form
        className="mt-0.5 flex flex-col gap-2.5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        noValidate
      >
        {tab === 'register' ? (
          <>
            <FormInput
              name="name"
              control={registerForm.control}
              label="Name"
              placeholder="Jane Doe"
              autoComplete="name"
              required
            />
            <FormInput
              name="email"
              control={registerForm.control}
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <FormInput
              name="password"
              control={registerForm.control}
              label="Password"
              type="password"
              placeholder={PASSWORD_PLACEHOLDER}
              autoComplete="new-password"
              required
            />
            <FormInput
              name="phone"
              control={registerForm.control}
              label="Mobile number"
              type="tel"
              placeholder="+91 9876543210"
              autoComplete="tel"
            />
          </>
        ) : (
          <>
            <FormInput
              name="email"
              control={loginForm.control}
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <FormInput
              name="password"
              control={loginForm.control}
              label="Password"
              type="password"
              placeholder={PASSWORD_PLACEHOLDER}
              autoComplete="current-password"
              required
            />
          </>
        )}

        {error ? (
          <Text type="danger" className="text-[13px]">
            {error}
          </Text>
        ) : null}

        <AppButton type="primary" size="large" block htmlType="submit" loading={isSubmitting}>
          {submitLabel}
        </AppButton>
      </form>

      <Divider plain className="!my-2">
        <Text type="secondary" className="text-xs">
          or continue with
        </Text>
      </Divider>

      <OAuthButtons onStart={startOAuth} />
    </Card>
  );
}
