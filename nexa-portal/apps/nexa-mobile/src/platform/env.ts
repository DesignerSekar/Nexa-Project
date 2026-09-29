/**
 * Metro / Expo env. Core never reads process.env; this is the mobile equivalent of
 * `@nexa/platform-web`'s `env.ts`.
 */
export const env = {
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080',
} as const;
