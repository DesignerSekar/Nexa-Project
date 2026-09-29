import { useEffect, useState } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

/** Tracks the OS colour-scheme preference, for `themeMode: 'system'`. */
export function useSystemTheme(): boolean {
  const [prefersDark, setPrefersDark] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia(QUERY);
    const handler = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  return prefersDark;
}
