import { getKeyValueStore } from '@nexa/auth';
import { DARK_PALETTE, LIGHT_PALETTE, type Palette } from '@nexa/tokens';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'nexa.mobile.theme';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'dark',
      setThemeMode: (themeMode) => set({ themeMode }),
      toggleThemeMode: () => set({ themeMode: get().themeMode === 'dark' ? 'light' : 'dark' }),
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => getKeyValueStore()),
      partialize: ({ themeMode }) => ({ themeMode }),
    }
  )
);

export function usePalette(): Palette {
  const mode = useThemeStore((s) => s.themeMode);
  return mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
}
