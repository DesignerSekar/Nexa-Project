import type { KeyValueStore } from '@nexa/auth';

/**
 * `localStorage` behind the `KeyValueStore` port, so Zustand `persist` has a storage that core
 * can describe without depending on the DOM. Mobile supplies an AsyncStorage adapter of the same
 * shape.
 *
 * Reads and writes are guarded: Safari private mode throws on `setItem`, and a theme preference
 * failing to save should not take the app down.
 */
export const localStorageStore: KeyValueStore = {
  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage unavailable or quota exceeded. The preference just will not persist.
    }
  },

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // As above.
    }
  },
};
