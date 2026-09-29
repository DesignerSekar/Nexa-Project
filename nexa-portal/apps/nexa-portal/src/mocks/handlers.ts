import { endpoints } from '@nexa/contract';
import { http, HttpResponse } from 'msw';
import { mockMessages, mockStats, mockUser } from './fixtures';

/**
 * Handlers for every endpoint the portal calls, and only those.
 *
 * Paths come from `@nexa/contract` rather than being retyped, so a contract change breaks the
 * mocks instead of letting them drift. Errors are returned in FastAPI's `{ detail }` shape, since
 * that is what `buildApiError` parses.
 *
 * Two endpoints in the contract have no handler on purpose: `/health`, which only the container
 * healthcheck hits, and the OAuth start URL, which is a full-page navigation and never fetched.
 */

let onboardPollCount = 0;
let bridgeStatuses: Record<string, string> = { whatsapp: 'connected', linkedin: 'logged_out' };

/** How many status polls before the mock session flips to connected. */
const POLLS_UNTIL_CONNECTED = 2;

export function resetMockState(): void {
  onboardPollCount = 0;
  bridgeStatuses = { whatsapp: 'connected', linkedin: 'logged_out' };
}

const QR_DATA_URL = 'data:image/png;base64,iVBORw0KGgo=';

export const handlers = [
  http.post(endpoints.auth.register, () => HttpResponse.json({ success: true, user: mockUser })),

  http.post(endpoints.auth.login, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === 'wrong') {
      return HttpResponse.json({ detail: 'Invalid credentials' }, { status: 401 });
    }
    return HttpResponse.json({ success: true, user: mockUser });
  }),

  http.get(endpoints.auth.me, () => HttpResponse.json({ authenticated: true, user: mockUser })),

  http.post(endpoints.auth.logout, () => HttpResponse.json({ success: true })),

  http.get(endpoints.stats, () => HttpResponse.json(mockStats)),

  http.get('/api/messages/recent', ({ request }) => {
    const limit = Number(new URL(request.url).searchParams.get('limit') ?? mockMessages.length);
    const messages = mockMessages.slice(0, limit);
    return HttpResponse.json({ messages, count: messages.length });
  }),

  http.post(endpoints.onboard.whatsappStart, () => {
    onboardPollCount = 0;
    return HttpResponse.json({
      session_id: 'session-1',
      status: 'pending',
      qr: QR_DATA_URL,
      matrix_user_id: '@nexa_wa_default:example.org',
    });
  }),

  http.get('/api/onboard/whatsapp/status/:sessionId', () => {
    onboardPollCount += 1;
    const status = onboardPollCount >= POLLS_UNTIL_CONNECTED ? 'connected' : 'pending';
    return HttpResponse.json({ status });
  }),

  http.get('/api/onboard/whatsapp/qr/:sessionId', () =>
    HttpResponse.json({ qr: QR_DATA_URL, status: 'pending' })
  ),

  http.delete('/api/onboard/whatsapp/session/:sessionId', () =>
    HttpResponse.json({ status: 'cancelled' })
  ),

  http.get('/api/bridge/:platform/status', ({ params }) => {
    const platform = String(params.platform);
    return HttpResponse.json({
      status: bridgeStatuses[platform] ?? 'disconnected',
      bridge_bot: `@${platform}bot:example.org`,
    });
  }),

  http.post('/api/bridge/:platform/logout', ({ params }) => {
    const platform = String(params.platform);
    bridgeStatuses[platform] = 'logged_out';
    return HttpResponse.json({ status: 'logged_out' });
  }),
];
