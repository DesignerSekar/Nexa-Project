import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const workspaceRoot = resolve(__dirname, '../..');

const alias = (p: string) => resolve(workspaceRoot, p);

export default defineConfig(({ mode }) => {
  /*
   * Empty prefix so non-`VITE_` keys are visible here. `NEXA_SIDECAR_URL` is deliberately
   * unprefixed: it configures the dev proxy inside this Node process and must never be inlined
   * into the client bundle.
   *
   * 8080 matches docker-compose. Running the sidecar directly with `python sidecar/main.py` binds
   * 8000 instead, so that case needs the variable overridden.
   */
  const env = loadEnv(mode, __dirname, '');
  const sidecarUrl = env.NEXA_SIDECAR_URL || 'http://localhost:8080';

  return {
    root: __dirname,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@nexa/contract': alias('libs/core/contract/src/index.ts'),
        '@nexa/data': alias('libs/core/data/src/index.ts'),
        '@nexa/auth': alias('libs/core/auth/src/index.ts'),
        '@nexa/schemas': alias('libs/core/schemas/src/index.ts'),
        '@nexa/tokens': alias('libs/core/tokens/src/index.ts'),
        '@nexa/util': alias('libs/core/util/src/index.ts'),
        '@nexa/platform-web': alias('libs/web/platform/src/index.ts'),
        '@nexa/theme-web': alias('libs/web/theme/src/index.ts'),
        '@nexa/shared-ui/providers': alias('libs/web/ui/src/providers/index.ts'),
        '@nexa/shared-ui/hooks': alias('libs/web/ui/src/hooks/index.ts'),
        '@nexa/shared-ui/utils': alias('libs/web/ui/src/utils/index.ts'),
        '@nexa/shared-ui/styles.css': alias('libs/web/ui/src/styles.css'),
        '@nexa/shared-ui': alias('libs/web/ui/src/index.ts'),
      },
    },
    server: {
      port: 3000,
      open: true,
      /*
       * Proxying rather than pointing the client at the sidecar's origin keeps every request
       * same-origin from the browser's point of view. The session is an HttpOnly cookie, so this
       * sidesteps CORS and SameSite entirely — and matches production, where nginx proxies /api.
       */
      proxy: {
        '/api': { target: sidecarUrl, changeOrigin: true },
        '/health': { target: sidecarUrl, changeOrigin: true },
      },
    },
    preview: { port: 3000 },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
      /*
       * Ant Design is ~1.2 MB minified on its own, so the default 500 kB warning fires on a
       * healthy build. The limit is set above it rather than silenced, so a regression in the app
       * chunk is still reported.
       */
      chunkSizeWarningLimit: 1300,
      rollupOptions: {
        output: {
          /*
           * A single chunk pushed the entry past 1.5 MB. Splitting the three big vendors out keeps
           * the app chunk small and lets nginx cache them across deploys, since their hashes only
           * change when the dependency does.
           *
           * Matched by module path rather than by package name, because the name form misses the
           * subpath entries (`react/jsx-runtime`, `react-dom/client`) and produced an empty chunk.
           */
          manualChunks(id: string) {
            if (!id.includes('node_modules')) return undefined;
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react';
            if (/[\\/]node_modules[\\/](antd|@ant-design|@rc-component)[\\/]/.test(id))
              return 'antd';
            if (/[\\/]node_modules[\\/]@tanstack[\\/]/.test(id)) return 'tanstack';
            return undefined;
          },
        },
      },
    },
  };
});
