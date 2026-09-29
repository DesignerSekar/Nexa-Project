import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const root = __dirname;

/**
 * Two projects on purpose. The `core` project runs in a plain node environment with no jsdom,
 * which is the standing proof that libs/core stays platform-neutral for React Native.
 * See docs/mobile-readiness.md.
 */
export default defineConfig({
  resolve: {
    alias: {
      '@nexa/contract': resolve(root, 'libs/core/contract/src/index.ts'),
      '@nexa/data': resolve(root, 'libs/core/data/src/index.ts'),
      '@nexa/auth': resolve(root, 'libs/core/auth/src/index.ts'),
      '@nexa/schemas': resolve(root, 'libs/core/schemas/src/index.ts'),
      '@nexa/tokens': resolve(root, 'libs/core/tokens/src/index.ts'),
      '@nexa/util': resolve(root, 'libs/core/util/src/index.ts'),
      '@nexa/platform-web': resolve(root, 'libs/web/platform/src/index.ts'),
      '@nexa/theme-web': resolve(root, 'libs/web/theme/src/index.ts'),
      '@nexa/shared-ui/providers': resolve(root, 'libs/web/ui/src/providers/index.ts'),
      '@nexa/shared-ui/hooks': resolve(root, 'libs/web/ui/src/hooks/index.ts'),
      '@nexa/shared-ui/utils': resolve(root, 'libs/web/ui/src/utils/index.ts'),
      '@nexa/shared-ui': resolve(root, 'libs/web/ui/src/index.ts'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'core',
          environment: 'node',
          include: ['libs/core/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: 'web',
          environment: 'jsdom',
          globals: true,
          setupFiles: [resolve(root, 'vitest.setup.ts')],
          include: ['apps/**/*.test.{ts,tsx}', 'libs/web/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
});
