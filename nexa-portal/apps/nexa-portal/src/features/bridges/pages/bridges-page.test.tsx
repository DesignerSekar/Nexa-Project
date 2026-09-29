import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../testing/test-utils';
import { BridgesPage } from './bridges-page';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

describe('BridgesPage', () => {
  it('renders exactly the two cards the legacy screen had', async () => {
    renderWithProviders(<BridgesPage />);

    expect(await screen.findByText('WhatsApp')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    // Instagram and Twitter are accepted by the sidecar but were never mounted. See DP-002.
    expect(screen.queryByText('Instagram')).not.toBeInTheDocument();
    expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
  });

  it('keeps the legacy descriptions verbatim', async () => {
    renderWithProviders(<BridgesPage />);

    expect(
      await screen.findByText('Receive and classify WhatsApp messages via mautrix-whatsapp')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Receive and classify LinkedIn messages via mautrix-linkedin')
    ).toBeInTheDocument();
  });

  it('humanises the status labels', async () => {
    renderWithProviders(<BridgesPage />);

    expect(await screen.findByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Logged Out')).toBeInTheDocument();
  });

  /** DP-003: the legacy Disconnect fires on the first click, with no confirmation dialog. */
  it('disconnects on the first click with no confirmation step', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BridgesPage />);

    const disconnect = await screen.findByRole('button', { name: /disconnect/i });
    await user.click(disconnect);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('Disconnected successfully.')).toBeInTheDocument();
  });

  /** DP-001: `/onboard-linkedin` was never a real route, so Connect is disabled rather than dead. */
  it("disables LinkedIn's Connect button instead of linking to a route that does not exist", async () => {
    renderWithProviders(<BridgesPage />);

    await waitFor(() => expect(screen.getByText('Logged Out')).toBeInTheDocument());
    const connectButtons = screen.getAllByRole('button', { name: 'Connect' });
    expect(connectButtons).toHaveLength(1);
    expect(connectButtons[0]).toBeDisabled();
  });
});
