import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

/**
 * Starts the service worker when `VITE_API_MODE=mock`.
 *
 * `onUnhandledRequest: 'bypass'` so Vite's own module and asset requests pass through untouched.
 */
export async function startMockWorker(): Promise<void> {
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}
