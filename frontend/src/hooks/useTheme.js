import { useCallback, useEffect, useState } from 'react';

/*
  Theme system. First-load default follows the OS `prefers-color-scheme`; an
  explicit toggle overrides it and is persisted so it's remembered on return.
  A matching no-FOUC inline script in index.html applies the class before
  paint, so this hook only needs to keep React state in sync with <html>.
*/
const STORAGE_KEY = 'devhire-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage unavailable — fall back to OS preference */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore persistence failure */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
