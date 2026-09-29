import { useAuthStore } from '@nexa/auth';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { startRequestLog } from '../../../testing/request-log';
import { renderWithProviders } from '../../../testing/test-utils';
import { LoginPage } from './login-page';

const navigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  useSearch: () => ({ redirect: undefined }),
}));

const startOAuthRedirect = vi.hoisted(() => vi.fn());
// Only `startOAuthRedirect` is stubbed; the axios client and cookie strategy stay real so the
// request assertions below still exercise the actual transport.
vi.mock('@nexa/platform-web', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, startOAuthRedirect };
});

describe('LoginPage', () => {
  let log: ReturnType<typeof startRequestLog>;

  beforeEach(() => {
    navigate.mockClear();
    startOAuthRedirect.mockClear();
    useAuthStore.getState().clear();
    log = startRequestLog();
  });

  afterEach(() => log.stop());

  it('renders the heading, subtitle, and tab labels', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByText('Nexa')).toBeInTheDocument();
    expect(
      screen.getByText('AI message routing for WhatsApp, LinkedIn, Instagram & X')
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Create account' })).toBeInTheDocument();
  });

  it('places the email form above OAuth buttons', () => {
    renderWithProviders(<LoginPage />);

    const signIn = screen.getByRole('button', { name: 'Sign in' });
    const google = screen.getByRole('button', { name: /Google/ });
    const divider = screen.getByText('or continue with');

    expect(signIn.compareDocumentPosition(divider) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(divider.compareDocumentPosition(google) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows only Email and Password on the sign-in tab', () => {
    renderWithProviders(<LoginPage />);

    expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Name/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Mobile number/)).not.toBeInTheDocument();
  });

  it('shows the mobile number field on the create-account tab', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('tab', { name: 'Create account' }));

    expect(await screen.findByLabelText(/Mobile number/)).toBeInTheDocument();
  });

  it('signs in and issues exactly one request', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), 'jane@example.com');
    await user.type(screen.getByLabelText(/Password/), 'secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
    expect(log.requests).toEqual([{ method: 'POST', path: '/api/auth/login' }]);
    expect(navigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/app/dashboard', replace: true })
    );
  });

  it('renders the FastAPI detail string on a failed sign-in', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), 'jane@example.com');
    await user.type(screen.getByLabelText(/Password/), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('clears the error when the user switches tabs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), 'jane@example.com');
    await user.type(screen.getByLabelText(/Password/), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await screen.findByText('Invalid credentials');

    await user.click(screen.getByRole('tab', { name: 'Create account' }));

    await waitFor(() => expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument());
  });

  it('omits a blank phone from the register body rather than sending an empty string', async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.use(
      http.post('/api/auth/register', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({
          success: true,
          user: { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
        });
      })
    );

    renderWithProviders(<LoginPage />);
    await user.click(screen.getByRole('tab', { name: 'Create account' }));

    await user.type(await screen.findByLabelText(/Name/), 'Jane Doe');
    await user.type(screen.getByLabelText(/Email/), 'jane@example.com');
    await user.type(screen.getByLabelText(/Password/), 'secret');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(body).toBeDefined());
    expect(body).toEqual({ name: 'Jane Doe', email: 'jane@example.com', password: 'secret' });
    expect(body).not.toHaveProperty('phone');
  });

  it('blocks submission and issues no request when required fields are empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(log.requests).toHaveLength(0);
  });

  it('accepts a one-character password, imposing no rule the legacy form did not', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.type(screen.getByLabelText(/Email/), 'jane@example.com');
    await user.type(screen.getByLabelText(/Password/), 'x');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true));
  });

  it('starts OAuth as a full-page navigation, not a fetch', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    await user.click(screen.getByRole('button', { name: /Google/ }));

    expect(startOAuthRedirect).toHaveBeenCalledWith('google');
    expect(log.requests).toHaveLength(0);
  });
});
