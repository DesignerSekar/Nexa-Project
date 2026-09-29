import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const workspaceRoot = resolve(__dirname, '../../../..');

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: async (viteConfig) => {
    const tailwindcss = (await import('@tailwindcss/vite')).default;
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...viteConfig.resolve?.alias,
        '@nexa/tokens': resolve(workspaceRoot, 'libs/core/tokens/src/index.ts'),
        '@nexa/util': resolve(workspaceRoot, 'libs/core/util/src/index.ts'),
        '@nexa/theme-web': resolve(workspaceRoot, 'libs/web/theme/src/index.ts'),
      },
    };
    return viteConfig;
  },
};

export default config;
