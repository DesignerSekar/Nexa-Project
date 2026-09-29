import type { DensityKey, FontFamilyKey } from '@nexa/tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppConfig {
  themeMode: ThemeMode;
  /** Null means "use the palette default". */
  primaryColor: string | null;
  density: DensityKey;
  fontFamily: FontFamilyKey;
  locale: string;
}

/**
 * Light by default, matching ecom-v2's rule 17.
 *
 * Note the legacy Nexa app was dark-only. Defaulting to light is a visual change, which is in
 * scope — the migration restyles freely, it just may not change behaviour. Dark remains one
 * toggle away and uses a black-based surface palette.
 */
export const DEFAULT_APP_CONFIG: AppConfig = {
  themeMode: 'light',
  /** Null keeps the palette primary (`#2563eb` light / `#3b82f6` dark). */
  primaryColor: null,
  density: 'default',
  fontFamily: 'inter',
  locale: 'en',
};

export const APP_CONFIG_STORAGE_KEY = 'nexa-user-theme-config';
