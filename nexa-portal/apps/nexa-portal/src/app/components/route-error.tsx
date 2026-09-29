import { extractApiError } from '@nexa/data';
import { AppButton } from '@nexa/shared-ui';
import { Result } from 'antd';
import { Link, type ErrorComponentProps } from '@tanstack/react-router';

/**
 * Router-level error boundary.
 *
 * This is a safety net for render and loader crashes only. Request failures inside the four
 * screens are still rendered inline by those screens, exactly as the legacy app did — routing
 * them here would change what the user sees.
 */
export function RouteError({ error, reset }: ErrorComponentProps) {
  return (
    <Result
      status="error"
      title="Something went wrong"
      subTitle={extractApiError(error, 'An unexpected error occurred.')}
      extra={[
        <AppButton key="retry" type="primary" onClick={reset}>
          Try again
        </AppButton>,
        <Link key="home" to="/app/dashboard">
          <AppButton>Back to dashboard</AppButton>
        </Link>,
      ]}
    />
  );
}

export function NotFound() {
  return (
    <Result
      status="404"
      title="404"
      subTitle="That page does not exist."
      extra={
        <Link to="/app/dashboard">
          <AppButton type="primary">Back to dashboard</AppButton>
        </Link>
      }
    />
  );
}
