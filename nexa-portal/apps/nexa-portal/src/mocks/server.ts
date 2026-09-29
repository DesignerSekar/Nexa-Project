import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** Node-side interceptor for Vitest. Started and stopped by `vitest.setup.ts`. */
export const server = setupServer(...handlers);
