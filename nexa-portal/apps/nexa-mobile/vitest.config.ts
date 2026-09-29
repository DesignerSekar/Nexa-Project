import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@nexa/contract': path.resolve(__dirname, '../../libs/core/contract/src/index.ts'),
      '@nexa/data': path.resolve(__dirname, '../../libs/core/data/src/index.ts'),
      '@nexa/auth': path.resolve(__dirname, '../../libs/core/auth/src/index.ts'),
    },
  },
});
