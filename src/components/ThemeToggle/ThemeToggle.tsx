import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

function getStoredTheme(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
  } else if (mode === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  // Keep system mode in sync with OS preference changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const cycle = () => {
    setMode((current) => {
      if (current === 'light') return 'dark';
      if (current === 'dark') return 'system';
      return 'light';
    });
  };

  const label =
    mode === 'light'
      ? 'Switch to dark mode'
      : mode === 'dark'
        ? 'Switch to system mode'
        : 'Switch to light mode';

  return (
    <button
      onClick={cycle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={label}
      title={label}
    >
      {mode === 'light' && <Sun className="w-5 h-5 text-yellow-500" />}
      {mode === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
      {mode === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
    </button>
  );
}
