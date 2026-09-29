import { HttpResponse, http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { startRequestLog } from '../../../testing/request-log';
import { renderWithProviders } from '../../../testing/test-utils';
import { DashboardPage } from './dashboard-page';

describe('DashboardPage', () => {
  let log: ReturnType<typeof startRequestLog> | undefined;

  afterEach(() => log?.stop());

  it('issues exactly the two requests the legacy screen made, with limit=10', async () => {
    log = startRequestLog();
    renderWithProviders(<DashboardPage />);

    await screen.findByText('gpt-4o-mini');

    expect(log.requests).toEqual([
      { method: 'GET', path: '/api/stats' },
      { method: 'GET', path: '/api/messages/recent?limit=10' },
    ]);
  });

  it('renders the three KPI cards with their labels', async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('gpt-4o-mini')).toBeInTheDocument();
    expect(screen.getByText('Total messages')).toBeInTheDocument();
    expect(screen.getByText('Pending actions')).toBeInTheDocument();
    expect(screen.getByText('AI classifier')).toBeInTheDocument();
    expect(screen.getByText('1,284')).toBeInTheDocument();
  });

  it('shows the sender without its homeserver and truncates long content', async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('@alice')).toBeInTheDocument();
    expect(screen.queryByText('@alice:example.org')).not.toBeInTheDocument();

    const truncated = screen.getByText(/^Following up on my previous note/);
    expect(truncated.textContent).toHaveLength(81);
    expect(truncated.textContent?.endsWith('\u2026')).toBe(true);
  });

  it('renders an em dash instead of a tag for an unclassified message', async () => {
    renderWithProviders(<DashboardPage />);
    await screen.findByText('@carol');
    expect(screen.getAllByText('\u2014').length).toBeGreaterThan(0);
  });

  it('renders the priority breakdown as a panel list, not a chart', async () => {
    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Priority breakdown')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('Classifier breakdown')).toBeInTheDocument();
    expect(screen.getAllByText('ENQUIRY').length).toBeGreaterThan(0);
    expect(document.querySelector('canvas')).toBeNull();
  });

  it('hides the priority section entirely when the breakdown is empty', async () => {
    server.use(
      http.get('/api/stats', () =>
        HttpResponse.json({
          total_messages: 0,
          pending_actions: 0,
          priority_breakdown: {},
          classifier_breakdown: {},
          classifier: 'none',
        })
      )
    );

    renderWithProviders(<DashboardPage />);

    await screen.findByText('none');
    expect(screen.queryByText('Priority breakdown')).not.toBeInTheDocument();
    expect(screen.queryByText('Classifier breakdown')).not.toBeInTheDocument();
  });

  it('shows the plain "No messages yet." text when there are no messages', async () => {
    server.use(
      http.get('/api/messages/recent', () => HttpResponse.json({ messages: [], count: 0 }))
    );

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('No messages yet.')).toBeInTheDocument();
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('filters recent messages when Pending actions KPI is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<DashboardPage />);

    await screen.findByText('@alice');
    await user.click(screen.getByRole('button', { name: /Pending actions/i }));

    expect(await screen.findByText('Filtered: needs attention')).toBeInTheDocument();
    expect(screen.getByText('@alice')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('@bob')).not.toBeInTheDocument());
  });

  /**
   * The legacy `.catch(() => {})` means a failed fetch renders zeroed cards, not an error. Worth
   * asserting because a well-meaning refactor to an error state would change what users see.
   */
  it('renders zeroed cards rather than an error when both requests fail', async () => {
    server.use(
      http.get('/api/stats', () => HttpResponse.json({ detail: 'boom' }, { status: 500 })),
      http.get('/api/messages/recent', () => HttpResponse.json({ detail: 'boom' }, { status: 500 }))
    );

    renderWithProviders(<DashboardPage />);

    await waitFor(() => expect(screen.getByText('No messages yet.')).toBeInTheDocument());
    expect(screen.getByText('Total messages')).toBeInTheDocument();
    expect(screen.queryByText('boom')).not.toBeInTheDocument();
  });
});
