import { z } from 'zod';

/**
 * Zod-validated environment.
 *
 * `VITE_API_URL` defaults to empty on purpose: production serves the SPA and proxies `/api`
 * through nginx on the same origin, which is what the legacy Dockerfile comment describes.
 *
 * This is the one module that reads `import.meta.env`, which is why it lives in the web tier.
 * Metro has no `import.meta`; mobile builds an object of the same shape from
 * `process.env.EXPO_PUBLIC_*`. See docs/mobile-readiness.md.
 */
const EnvSchema = z.object({
  VITE_API_URL: z.string().default(''),
  VITE_API_MODE: z.enum(['mock', 'real']).default('mock'),
  VITE_APP_TITLE: z.string().default('Nexa'),
});

export type AppEnv = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_API_MODE: import.meta.env.VITE_API_MODE,
  VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
});

if (!parsed.success) {
  throw new Error(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
}

export const env: AppEnv = parsed.data;

export const isMockMode = env.VITE_API_MODE === 'mock';
