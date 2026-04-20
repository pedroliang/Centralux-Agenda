import { useCallback, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

const KEY = 'celtralux-theme';

function readInitial(): ThemeMode {
  try {
    const t = localStorage.getItem(KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch { /* ignore */ }
  // Padrão do produto: SEMPRE iniciar no dark (mesmo sem preferência salva).
  return 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(readInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggle };
}
