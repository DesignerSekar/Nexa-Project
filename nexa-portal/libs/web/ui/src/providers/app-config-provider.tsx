import {
  buildAntdTheme,
  DEFAULT_APP_CONFIG,
  resolveThemeMode,
  type AppConfig,
} from '@nexa/theme-web';
import { StyleProvider } from '@ant-design/cssinjs';
import { App as AntdApp, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useSystemTheme } from '../hooks/use-system-theme';

interface AppConfigContextValue {
  config: AppConfig;
  resolvedMode: 'light' | 'dark';
}

const AppConfigContext = createContext<AppConfigContextValue>({
  config: DEFAULT_APP_CONFIG,
  resolvedMode: 'light',
});

export function useAppConfig(): AppConfigContextValue {
  return useContext(AppConfigContext);
}

interface AppConfigProviderProps {
  config: AppConfig;
  children: ReactNode;
}

/**
 * The single root theme provider.
 *
 * `StyleProvider layer` puts Ant Design's generated CSS into the `antd` layer declared in
 * styles.css, which is what lets Tailwind utilities win without `!important`.
 *
 * The Ant Design `App` wrapper is required: `useToast` and `useConfirm` call `App.useApp()`, and
 * without it they fall back to the static API, which cannot see the theme.
 */
export function AppConfigProvider({ config, children }: AppConfigProviderProps) {
  const prefersDark = useSystemTheme();
  const resolvedMode = resolveThemeMode(config.themeMode, prefersDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedMode === 'dark');
    root.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  return (
    <StyleProvider layer>
      <ConfigProvider theme={buildAntdTheme(config, prefersDark)} locale={enUS}>
        <AntdApp component={false}>
          <AppConfigContext.Provider value={{ config, resolvedMode }}>
            {children}
          </AppConfigContext.Provider>
        </AntdApp>
      </ConfigProvider>
    </StyleProvider>
  );
}
