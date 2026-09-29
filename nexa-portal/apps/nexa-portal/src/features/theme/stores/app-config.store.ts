import { getKeyValueStore } from '@nexa/auth';
import {
  APP_CONFIG_STORAGE_KEY,
  DEFAULT_APP_CONFIG,
  type AppConfig,
  type ThemeMode,
} from '@nexa/theme-web';
import type { DensityKey, FontFamilyKey } from '@nexa/tokens';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

interface AppConfigState extends AppConfig {
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setPrimaryColor: (color: string | null) => void;
  setDensity: (density: DensityKey) => void;
  setFontFamily: (font: FontFamilyKey) => void;
  reset: () => void;
}

/**
 * Persisted appearance preferences.
 *
 * Storage goes through the `KeyValueStore` port rather than `localStorage` directly, so the shape
 * is the one the mobile app will reuse with AsyncStorage. The port is resolved lazily because the
 * composition root binds it after this module is evaluated.
 */
export const useAppConfigStore = create<AppConfigState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_APP_CONFIG,

      setThemeMode: (themeMode) => set({ themeMode }),
      toggleThemeMode: () => set({ themeMode: get().themeMode === 'dark' ? 'light' : 'dark' }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      setDensity: (density) => set({ density }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      reset: () => set({ ...DEFAULT_APP_CONFIG }),
    }),
    {
      name: APP_CONFIG_STORAGE_KEY,
      storage: createJSONStorage(() => getKeyValueStore()),
      // fontFamily is not persisted — Inter is the product default from DEFAULT_APP_CONFIG.
      partialize: ({ themeMode, primaryColor, density, locale }) => ({
        themeMode,
        primaryColor,
        density,
        locale,
      }),
    }
  )
);

/**
 * Selector for the provider. `useShallow` is required: returning a fresh object from a Zustand v5
 * selector without it re-renders on every store read.
 */
export function useAppConfigValue(): AppConfig {
  return useAppConfigStore(
    useShallow((state) => ({
      themeMode: state.themeMode,
      primaryColor: state.primaryColor,
      density: state.density,
      fontFamily: state.fontFamily,
      locale: state.locale,
    }))
  );
}
