import { server } from '../mocks/server';

export interface LoggedRequest {
  method: string;
  path: string;
}

/**
 * Records every request MSW intercepts, so a test can assert the exact sequence a screen issues.
 *
 * This is the unit-level counterpart to the Phase 9 network diff: the acceptance criterion for the
 * rebuild is that each screen makes the same calls, in the same order, as the legacy one. A
 * snapshot of the log catches an accidental extra fetch that a rendering assertion would not.
 */
export function startRequestLog(): { requests: LoggedRequest[]; stop: () => void } {
  const requests: LoggedRequest[] = [];

  const listener = ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    requests.push({ method: request.method, path: `${url.pathname}${url.search}` });
  };

  server.events.on('request:start', listener);

  return {
    requests,
    stop: () => server.events.removeListener('request:start', listener),
  };
}
