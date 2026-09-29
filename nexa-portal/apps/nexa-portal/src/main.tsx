// Ant Design 6 supports React 19 natively, so no `@ant-design/v5-patch-for-react-19` is needed.
import '@nexa/shared-ui/styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/app-providers';
import { configurePlatform } from './app/composition-root';

// Ports must be bound before anything imports a query or calls an API, because route `beforeLoad`
// runs as soon as the router mounts.
configurePlatform();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found in index.html');
}

/**
 * In mock mode the service worker has to be listening before the first render, or the root route's
 * `/api/auth/me` probe escapes to the network and the app boots as signed out.
 *
 * The condition reads `import.meta.env` directly instead of the validated `isMockMode` from
 * `@nexa/platform-web`. That is deliberate and the only place it happens outside `env.ts`: Vite
 * inlines this as a literal, which makes the branch statically dead in a real build and lets
 * Rollup drop MSW and the fixtures entirely. Going through `isMockMode` shipped a 296 kB mock
 * chunk in the production image.
 */
async function bootstrap() {
  if (import.meta.env.VITE_API_MODE === 'mock') {
    const { startMockWorker } = await import('./mocks/browser');
    await startMockWorker();
  }

  createRoot(container as HTMLElement).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>
  );
}

void bootstrap();
