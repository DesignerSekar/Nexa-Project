import type { Palette } from '@nexa/tokens';
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

/**
 * Map shared `@nexa/tokens` palettes onto Paper MD3 so mobile matches the web portal.
 */
export function buildPaperTheme(mode: 'light' | 'dark', palette: Palette): MD3Theme {
  const base = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const surface = mode === 'dark' ? '#0a0a0a' : '#ffffff';
  const outline = mode === 'dark' ? '#333333' : '#e2e8f0';

  return {
    ...base,
    colors: {
      ...base.colors,
      primary: palette.colorPrimary,
      secondary: palette.colorPrimary,
      tertiary: palette.colorInfo,
      error: palette.colorError,
      background: palette.colorBgBase,
      surface,
      surfaceVariant: mode === 'dark' ? '#141414' : '#f1f5f9',
      onBackground: palette.colorTextBase,
      onSurface: palette.colorTextBase,
      onSurfaceVariant: mode === 'dark' ? '#a3a3a3' : '#64748b',
      onPrimary: '#ffffff',
      onError: '#ffffff',
      outline,
      outlineVariant: outline,
      elevation: {
        ...base.colors.elevation,
        level0: palette.colorBgBase,
        level1: surface,
        level2: surface,
        level3: surface,
        level4: surface,
        level5: surface,
      },
    },
    roundness: 8,
  };
}
