import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { resetMockState } from './apps/nexa-portal/src/mocks/handlers';
import { server } from './apps/nexa-portal/src/mocks/server';

// `error` rather than `bypass`: in tests an unhandled request means the code is calling an endpoint
// the contract does not list, which is exactly the parity regression worth failing on.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetMockState();
});

afterAll(() => server.close());

// Ant Design reads matchMedia through its responsive observer; jsdom does not implement it.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom throws "Not implemented" for the two-argument form, which Ant Design's Table calls while
// measuring scrollbar width. Stubbing the pseudo-element argument away keeps the output readable.
const originalGetComputedStyle = window.getComputedStyle.bind(window);
window.getComputedStyle = ((element: Element) =>
  originalGetComputedStyle(element)) as typeof window.getComputedStyle;

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}
