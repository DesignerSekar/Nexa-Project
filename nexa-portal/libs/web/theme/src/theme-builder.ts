import {
  DARK_PALETTE,
  FONT_FAMILIES,
  FONT_SIZES,
  LIGHT_PALETTE,
  RADIUS,
  type Palette,
} from '@nexa/tokens';
import { theme, type ThemeConfig } from 'antd';
import type { AppConfig, ThemeMode } from './app-config';

/** `system` resolves against the OS preference; everything else passes through. */
export function resolveThemeMode(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'system') return prefersDark ? 'dark' : 'light';
  return mode;
}

function paletteFor(mode: 'light' | 'dark'): Palette {
  return mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
}

/**
 * One root theme for the whole app.
 *
 * Nesting a second `ConfigProvider` that hardcodes surfaces is the usual way dark mode ends up
 * half-applied, so `NexaThemeProvider` stays a thin shell for global styles and fonts only.
 */
export function buildAntdTheme(config: AppConfig, prefersDark: boolean): ThemeConfig {
  const mode = resolveThemeMode(config.themeMode, prefersDark);
  const palette = paletteFor(mode);

  return {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    cssVar: { prefix: 'nexa' },
    hashed: true,
    token: {
      colorPrimary: config.primaryColor ?? palette.colorPrimary,
      colorSuccess: palette.colorSuccess,
      colorWarning: palette.colorWarning,
      colorError: palette.colorError,
      colorInfo: config.primaryColor ?? palette.colorInfo,
      colorBgBase: palette.colorBgBase,
      colorTextBase: palette.colorTextBase,
      fontFamily: FONT_FAMILIES[config.fontFamily],
      fontSize: FONT_SIZES[config.density],
      borderRadius: RADIUS.md,
      borderRadiusLG: RADIUS.lg,
    },
    components: {
      Layout: {
        // Black shell: pure black page canvas, near-black elevated chrome.
        siderBg: mode === 'dark' ? '#0a0a0a' : '#ffffff',
        headerBg: mode === 'dark' ? '#0a0a0a' : '#ffffff',
        bodyBg: mode === 'dark' ? '#000000' : '#f5f7fa',
        headerPadding: '0 24px',
      },
      Menu: {
        // Keep menu surfaces on the black shell instead of Ant's default dark-blue greys.
        ...(mode === 'dark'
          ? {
              darkItemBg: '#0a0a0a',
              darkSubMenuItemBg: '#0a0a0a',
              darkPopupBg: '#141414',
              itemBg: '#0a0a0a',
            }
          : {}),
      },
      Card: {
        borderRadiusLG: RADIUS.lg,
        ...(mode === 'dark' ? { colorBgContainer: '#0a0a0a' } : {}),
      },
      Table: {
        headerBg: 'transparent',
      },
    },
  };
}
