/**
 * Design tokens as plain objects, so both the Ant Design theme builder and a future React Native
 * UI kit can read the same values. Nothing here imports a UI library.
 */

export interface Palette {
  colorPrimary: string;
  colorSuccess: string;
  colorWarning: string;
  colorError: string;
  colorInfo: string;
  colorBgBase: string;
  colorTextBase: string;
}

/**
 * Primary is carried over from the legacy UI's accent (`#2563eb` on buttons, `#3b82f6` on
 * highlights) so the rebuild reads as the same product. The rest are Ant Design's defaults,
 * because the legacy app had no semantic palette to port.
 */
export const LIGHT_PALETTE: Palette = {
  colorPrimary: '#2563eb',
  colorSuccess: '#16a34a',
  colorWarning: '#f59e0b',
  colorError: '#dc2626',
  colorInfo: '#2563eb',
  colorBgBase: '#ffffff',
  colorTextBase: '#0f172a',
};

export const DARK_PALETTE: Palette = {
  colorPrimary: '#3b82f6',
  colorSuccess: '#22c55e',
  colorWarning: '#f59e0b',
  colorError: '#f87171',
  colorInfo: '#3b82f6',
  // Black-based dark surfaces (not slate-blue). Primary stays blue as the accent only.
  colorBgBase: '#000000',
  colorTextBase: '#fafafa',
};

/**
 * Classification pill colours on the Dashboard.
 *
 * The legacy screen hardcodes a background and text colour per label. Here only the semantic
 * intent is kept; the concrete colours come from Ant Design tokens at render time, so the pills
 * follow the theme instead of staying dark-mode colours on a light background.
 */
export const CLASSIFICATION_INTENT = {
  ENQUIRY: 'processing',
  INTENT: 'success',
  PROMOTION: 'warning',
  SOCIAL: 'purple',
} as const;

export type ClassificationLabel = keyof typeof CLASSIFICATION_INTENT;

export const CLASSIFICATION_FALLBACK_INTENT = 'default';
