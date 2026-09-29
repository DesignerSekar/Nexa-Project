import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;

/**
 * Runs against the production build with MSW serving the sidecar, so the flow can be exercised
 * without the Python backend. `VITE_API_MODE=mock` is what makes `main.tsx` start the worker.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: `pnpm --filter @nexa/nexa-portal exec vite build --mode mock && pnpm --filter @nexa/nexa-portal exec vite preview --port ${PORT} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
