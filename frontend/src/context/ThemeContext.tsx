import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'high-contrast' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  resolvedTheme: 'dark' | 'light' | 'high-contrast';
}

const THEME_ORDER: Theme[] = ['dark', 'light', 'high-contrast', 'system'];
const STORAGE_KEY = 'brewbuddy-theme';

function getSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getResolvedTheme(theme: Theme): 'dark' | 'light' | 'high-contrast' {
  if (theme === 'system') return getSystemTheme();
  return theme;
}

function applyThemeClass(resolved: 'dark' | 'light' | 'high-contrast') {
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast');
  root.classList.add(`theme-${resolved}`);
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored && THEME_ORDER.includes(stored)) return stored;
  return 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light' | 'high-contrast'>(() =>
    getResolvedTheme(getInitialTheme())
  );

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    const resolved = getResolvedTheme(newTheme);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
  };

  const cycleTheme = () => {
    const currentIndex = THEME_ORDER.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEME_ORDER.length;
    setTheme(THEME_ORDER[nextIndex]);
  };

  // Apply theme on mount
  useEffect(() => {
    const resolved = getResolvedTheme(theme);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
  }, []);

  // Listen for OS theme changes when in system mode
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'light' : 'dark';
      setResolvedTheme(resolved);
      applyThemeClass(resolved);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function getThemeIcon(theme: Theme): string {
  switch (theme) {
    case 'light': return '☀️';
    case 'dark': return '🌙';
    case 'high-contrast': return '◐';
    case 'system': return '💻';
  }
}

export function getThemeLabel(theme: Theme): string {
  switch (theme) {
    case 'light': return 'Light Mode';
    case 'dark': return 'Dark Mode';
    case 'high-contrast': return 'High Contrast';
    case 'system': return 'System';
  }
}
