# Sprint 6: Theme Switching + Hero Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the hero visibility bug and add 4-mode theme switching (Light, Dark, High Contrast, System) with a Navbar toggle.

**Architecture:** CSS custom properties define all theme colors. Tailwind maps to those variables. A React Context manages theme state, persists to localStorage, and applies the correct class to `<html>`. A Navbar toggle cycles through modes.

**Tech Stack:** React, TypeScript, Tailwind CSS, CSS Custom Properties, localStorage

---

## File Structure

**New files:**
- `frontend/src/context/ThemeContext.tsx` — Theme provider + `useTheme` hook
- `frontend/src/components/Navbar/ThemeToggle.tsx` — Toggle button component

**Modified files:**
- `frontend/src/styles/global.css` — Full CSS variable sets for all 4 themes + media queries
- `frontend/tailwind.config.js` — Map theme colors to CSS variables
- `frontend/src/components/Layout/Navbar.tsx` — Add ThemeToggle
- `frontend/src/App.tsx` — Wrap with ThemeProvider
- `frontend/src/pages/Landing.tsx` — Fix hero visibility
- `frontend/src/components/UI/Button.tsx` — Use theme-aware colors
- `frontend/src/components/UI/Card.tsx` — Use theme-aware colors
- `frontend/src/components/UI/Input.tsx` — Use theme-aware colors
- All pages — Replace hardcoded `bg-brewery-black`, `text-white`, `text-gray-400` etc. with theme-aware classes

---

### Task 1: CSS Theme Variables

**Files:**
- Modify: `frontend/src/styles/global.css`

- [ ] **Step 1: Define CSS variable sets for all 4 themes**

Replace the contents of `global.css` with:

```css
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ========== DEFAULT DARK THEME ========== */
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --bg-card: #1a1a1a;
  --bg-input: rgba(26, 26, 26, 0.8);
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
  --text-muted: #6b6b6b;
  --accent-primary: #d97706;
  --accent-secondary: #b45309;
  --accent-hover: #f59e0b;
  --border-default: #2a2a2a;
  --border-hover: #3a3a3a;
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
  --shadow-hover: 0 0 20px rgba(217, 119, 6, 0.15);
  --scrollbar-track: #1a1a1a;
  --scrollbar-thumb: #d97706;
  --navbar-bg: rgba(26, 26, 26, 0.8);
  --navbar-border: #2a2a2a;
  --tag-bg: rgba(217, 119, 6, 0.1);
  --tag-border: rgba(217, 119, 6, 0.3);
  --tag-text: #f59e0b;
  --overlay-bg: rgba(0, 0, 0, 0.6);
}

/* ========== LIGHT THEME ========== */
.theme-light {
  --bg-primary: #faf7f2;
  --bg-secondary: #f0ebe3;
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --text-primary: #1a1612;
  --text-secondary: #6b5e52;
  --text-muted: #9a8d82;
  --accent-primary: #d97706;
  --accent-secondary: #b45309;
  --accent-hover: #b45309;
  --border-default: #e8e0d8;
  --border-hover: #d4c8bc;
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
  --shadow-hover: 0 0 20px rgba(217, 119, 6, 0.1);
  --scrollbar-track: #f0ebe3;
  --scrollbar-thumb: #d97706;
  --navbar-bg: rgba(250, 247, 242, 0.9);
  --navbar-border: #e8e0d8;
  --tag-bg: rgba(217, 119, 6, 0.1);
  --tag-border: rgba(217, 119, 6, 0.3);
  --tag-text: #b45309;
  --overlay-bg: rgba(0, 0, 0, 0.3);
}

/* ========== HIGH CONTRAST THEME ========== */
.theme-high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-card: #0a0a0a;
  --bg-input: #0a0a0a;
  --text-primary: #ffffff;
  --text-secondary: #e0e0e0;
  --text-muted: #b0b0b0;
  --accent-primary: #f59e0b;
  --accent-secondary: #d97706;
  --accent-hover: #fbbf24;
  --border-default: #ffffff;
  --border-hover: #f59e0b;
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  --shadow-hover: 0 0 20px rgba(245, 158, 11, 0.3);
  --scrollbar-track: #0a0a0a;
  --scrollbar-thumb: #f59e0b;
  --navbar-bg: rgba(0, 0, 0, 0.95);
  --navbar-border: #ffffff;
  --tag-bg: rgba(245, 158, 11, 0.15);
  --tag-border: #f59e0b;
  --tag-text: #fbbf24;
  --overlay-bg: rgba(0, 0, 0, 0.8);
}

/* ========== SYSTEM THEME (follows OS preference) ========== */
@media (prefers-color-scheme: light) {
  :root:not(.theme-dark):not(.theme-light):not(.theme-high-contrast) {
    --bg-primary: #faf7f2;
    --bg-secondary: #f0ebe3;
    --bg-card: #ffffff;
    --bg-input: #ffffff;
    --text-primary: #1a1612;
    --text-secondary: #6b5e52;
    --text-muted: #9a8d82;
    --accent-primary: #d97706;
    --accent-secondary: #b45309;
    --accent-hover: #b45309;
    --border-default: #e8e0d8;
    --border-hover: #d4c8bc;
    --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
    --shadow-hover: 0 0 20px rgba(217, 119, 6, 0.1);
    --scrollbar-track: #f0ebe3;
    --scrollbar-thumb: #d97706;
    --navbar-bg: rgba(250, 247, 242, 0.9);
    --navbar-border: #e8e0d8;
    --tag-bg: rgba(217, 119, 6, 0.1);
    --tag-border: rgba(217, 119, 6, 0.3);
    --tag-text: #b45309;
    --overlay-bg: rgba(0, 0, 0, 0.3);
  }
}

/* ========== BASE STYLES ========== */
* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  margin: 0;
  padding: 0;
  transition: background-color 0.2s ease, color 0.2s ease;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}

::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--accent-hover);
}

/* ========== UTILITY CLASSES ========== */
.gradient-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-glow {
  transition: all 0.3s ease;
}

.hover-glow:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
}

/* Theme-aware card style */
.card-theme {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  box-shadow: var(--shadow-card);
  transition: all 0.3s ease;
}

.card-theme:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-hover);
}

/* Theme-aware input style */
.input-theme {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.input-theme:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
}

.input-theme::placeholder {
  color: var(--text-muted);
}

/* Theme-aware navbar */
.navbar-theme {
  background: var(--navbar-bg);
  border-color: var(--navbar-border);
}

/* Theme-aware tag/badge */
.tag-theme {
  background: var(--tag-bg);
  border: 1px solid var(--tag-border);
  color: var(--tag-text);
}

/* No-transition utility for initial load */
.no-transition {
  transition: none !important;
}
```

- [ ] **Step 2: Verify CSS loads correctly**

Run: `cd frontend && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds with no CSS errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/styles/global.css
git commit -m "feat(theme): add CSS variable sets for light, dark, high-contrast, and system themes"
```

---

### Task 2: Tailwind Theme Mapping

**Files:**
- Modify: `frontend/tailwind.config.js`

- [ ] **Step 1: Map Tailwind colors to CSS variables**

Replace `tailwind.config.js` with:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Map Tailwind utilities to CSS variables
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          input: 'var(--bg-input)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          hover: 'var(--accent-hover)',
        },
        border: {
          DEFAULT: 'var(--border-default)',
          hover: 'var(--border-hover)',
        },
        brewery: {
          black: 'var(--bg-primary)',
          dark: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
          amber: 'var(--accent-primary)',
          copper: 'var(--accent-secondary)',
          cream: 'var(--text-primary)',
          gray: 'var(--text-secondary)',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--accent-primary)' },
          '100%': { boxShadow: '0 0 20px var(--accent-primary)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Verify Tailwind builds with new config**

Run: `cd frontend && npx vite build --mode development 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.js
git commit -m "feat(theme): map Tailwind utilities to CSS custom properties"
```

---

### Task 3: ThemeContext + useTheme Hook

**Files:**
- Create: `frontend/src/context/ThemeContext.tsx`

- [ ] **Step 1: Create ThemeContext with provider and hook**

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'high-contrast' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  resolvedTheme: 'dark' | 'light' | 'high-contrast'; // actual applied theme (system resolves here)
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
  return 'dark'; // default
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

// Icons for each theme
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit 2>&1 | tail -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/context/ThemeContext.tsx
git commit -m "feat(theme): add ThemeContext with 4-mode support and localStorage persistence"
```

---

### Task 4: ThemeToggle Component

**Files:**
- Create: `frontend/src/components/Navbar/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle button**

```typescript
import { useTheme, getThemeIcon, getThemeLabel } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      onClick={cycleTheme}
      className="relative w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all hover:bg-[var(--bg-secondary)]"
      title={getThemeLabel(theme)}
      aria-label={`Current theme: ${getThemeLabel(theme)}. Click to cycle themes.`}
    >
      {getThemeIcon(theme)}
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit 2>&1 | tail -10`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navbar/ThemeToggle.tsx
git commit -m "feat(theme): add ThemeToggle button component"
```

---

### Task 5: Wire ThemeProvider + ThemeToggle into App

**Files:**
- Modify: `frontend/src/App.tsx` — Wrap with ThemeProvider
- Modify: `frontend/src/components/Layout/Navbar.tsx` — Add ThemeToggle

- [ ] **Step 1: Wrap App with ThemeProvider**

In `frontend/src/App.tsx`, update the imports and wrap:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { RecipeList } from './pages/RecipeList';
import { RecipeDetail } from './pages/RecipeDetail';
import { RecipeForm } from './pages/RecipeForm';
import { BrewSessionList } from './pages/BrewSessionList';
import { BrewSessionDetail } from './pages/BrewSessionDetail';
import { BrewTimer } from './pages/BrewTimer';
import { Landing } from './pages/Landing';

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: 'var(--accent-primary)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg" style={{ color: 'var(--accent-primary)' }}>Loading BrewBuddy...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recipes" element={<RecipeList />} />
        <Route path="/recipes/new" element={<RecipeForm />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipes/:id/edit" element={<RecipeForm />} />
        <Route path="/brew-sessions" element={<BrewSessionList />} />
        <Route path="/brew-sessions/:id" element={<BrewSessionDetail />} />
        <Route path="/brew-sessions/:id/timer" element={<BrewTimer />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen">
            <AppRoutes />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
```

- [ ] **Step 2: Add ThemeToggle to Navbar**

In `frontend/src/components/Layout/Navbar.tsx`, add the import and toggle:

```typescript
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../Navbar/ThemeToggle';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/recipes', label: 'Recipes', icon: '📜' },
    { path: '/brew-sessions', label: 'Brew Sessions', icon: '🍺' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-theme backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="text-3xl">🍺</span>
            <span className="font-display text-2xl font-bold gradient-text">BrewBuddy</span>
          </Link>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: location.pathname === item.path ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    backgroundColor: location.pathname === item.path ? 'var(--tag-bg)' : 'transparent',
                  }}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}>
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm rounded-lg transition-colors text-white"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit 2>&1 | tail -10`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/Layout/Navbar.tsx
git commit -m "feat(theme): wire ThemeProvider into App and ThemeToggle into Navbar"
```

---

### Task 6: Fix Landing Hero Visibility

**Files:**
- Modify: `frontend/src/pages/Landing.tsx`

- [ ] **Step 1: Remove opacity-0 and fix hero**

In `frontend/src/pages/Landing.tsx`, make these changes:

1. Remove the `heroRef` and `useEffect` (lines 5-11)
2. Remove `opacity-0` from the hero div
3. Keep `animate-fade-in` directly on the div (no JS dependency)
4. Update hardcoded colors to theme variables
5. Bump gradient orb opacity from 10% to 15%

The hero section should become:

```tsx
<div className="relative animate-fade-in">
  {/* Animated background gradient orbs */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)' }} />
    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: 'rgba(180, 83, 9, 0.15)', animationDelay: '1s' }} />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08), transparent)' }} />
  </div>

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
    <div className="text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full tag-theme mb-8">
        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-primary)' }} />
        <span className="text-sm font-medium tracking-wide uppercase" style={{ color: 'var(--tag-text)' }}>Open Source Brewing</span>
      </div>

      {/* Title */}
      <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tight">
        <span style={{ color: 'var(--text-primary)' }}>Brew</span>
        <span className="gradient-text">Buddy</span>
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Your modern brewing assistant. Craft perfect beer with smart recipes,
        precise timers, and detailed session tracking.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/register"
          className="group relative px-8 py-4 font-display font-semibold text-lg rounded-xl transition-all duration-300 text-white"
          style={{ backgroundColor: 'var(--accent-primary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-primary)')}
        >
          <span className="relative z-10">Start Brewing</span>
        </Link>
        <Link
          to="/login"
          className="px-8 py-4 font-display font-semibold text-lg rounded-xl transition-all duration-300"
          style={{
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  </div>
</div>
```

Also update the Features Section and Stats Section to use theme variables (replace `text-gray-400`, `text-gray-500`, `bg-brewery-dark/80`, `border-white/5` etc. with theme-aware inline styles or CSS variable classes).

- [ ] **Step 2: Run existing tests to verify no breakage**

Run: `cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -20`
Expected: All tests pass (some may need updates in Task 8)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Landing.tsx
git commit -m "fix(hero): remove opacity-0 dependency and fix hero visibility on page load"
```

---

### Task 7: Update UI Components to Use Theme Variables

**Files:**
- Modify: `frontend/src/components/UI/Button.tsx`
- Modify: `frontend/src/components/UI/Card.tsx`
- Modify: `frontend/src/components/UI/Input.tsx`

- [ ] **Step 1: Update Button.tsx**

Replace hardcoded colors with CSS variables:

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-display font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

  const variants: Record<string, string> = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'border',
    danger: 'text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: { backgroundColor: 'var(--accent-primary)' },
    secondary: { backgroundColor: 'var(--bg-secondary)' },
    ghost: { backgroundColor: 'transparent', borderColor: 'var(--border-default)', color: 'var(--text-primary)' },
    danger: { backgroundColor: '#dc2626' },
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={variantStyles[variant]}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Update Card.tsx**

```typescript
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`card-theme rounded-xl p-6 ${hover ? 'hover-glow cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-display text-xl font-semibold ${className}`} style={{ color: 'var(--text-primary)' }}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
```

- [ ] **Step 3: Update Input.tsx**

```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
        <input
          className={`w-full input-theme rounded-lg px-4 py-3 ${error ? 'border-red-500' : ''} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <textarea
        className={`w-full input-theme rounded-lg px-4 py-3 ${error ? 'border-red-500' : ''} resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd frontend && npx tsc --noEmit 2>&1 | tail -10`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/UI/Button.tsx frontend/src/components/UI/Card.tsx frontend/src/components/UI/Input.tsx
git commit -m "feat(theme): update UI components to use CSS variable theme system"
```

---

### Task 8: Update All Pages to Use Theme Variables

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Register.tsx`
- Modify: `frontend/src/pages/RecipeList.tsx`
- Modify: `frontend/src/pages/RecipeDetail.tsx`
- Modify: `frontend/src/pages/RecipeForm.tsx`
- Modify: `frontend/src/pages/BrewSessionList.tsx`
- Modify: `frontend/src/pages/BrewSessionDetail.tsx`
- Modify: `frontend/src/pages/BrewTimer.tsx`
- Modify: `frontend/src/components/Layout/AppLayout.tsx`

- [ ] **Step 1: Update Dashboard.tsx**

Replace all hardcoded colors with theme variables. Key changes:
- `bg-brewery-black` → `style={{ backgroundColor: 'var(--bg-primary)' }}`
- `text-gray-400` → `style={{ color: 'var(--text-secondary)' }}`
- `bg-gray-800/50` → use `card-theme` class
- `border-gray-700/50` → removed (handled by `card-theme`)
- `gradient-text` → keep (already theme-aware in global.css)

The full updated Dashboard.tsx:

```tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recipeAPI, brewSessionAPI } from '../services/api';
import { Recipe, BrewSession } from '../types';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    activeSessions: 0,
    completedSessions: 0,
  });
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [recipesRes, sessionsRes] = await Promise.all([
        recipeAPI.getRecipes({ limit: 5, sort: '-createdAt' }),
        brewSessionAPI.getSessions({ limit: 10 }),
      ]);
      const recipes = recipesRes.data.recipes || [];
      const sessions = sessionsRes.data.sessions || [];
      setRecentRecipes(recipes);
      setStats({
        totalRecipes: recipesRes.data.total || recipes.length,
        activeSessions: sessions.filter((s: BrewSession) => s.status === 'in_progress').length,
        completedSessions: sessions.filter((s: BrewSession) => s.status === 'bottled' || s.status === 'consumed').length,
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Recipes', value: stats.totalRecipes, icon: '📜' },
    { label: 'Active Brews', value: stats.activeSessions, icon: '🍺' },
    { label: 'Completed', value: stats.completedSessions, icon: '✅' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">
            Welcome to <span className="gradient-text">BrewBuddy</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your brewing dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="card-theme rounded-xl p-6 hover-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card-theme rounded-xl p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/recipes"
              className="px-6 py-3 font-semibold rounded-lg transition-all hover-glow text-white"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              + New Recipe
            </Link>
            <Link
              to="/brew-sessions"
              className="px-6 py-3 font-semibold rounded-lg transition-all"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              View Brew Sessions
            </Link>
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="card-theme rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Recipes</h2>
            <Link to="/recipes" className="text-sm" style={{ color: 'var(--accent-primary)' }}>
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
          ) : recentRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>No recipes yet</p>
              <Link to="/recipes" style={{ color: 'var(--accent-primary)' }}>
                Create your first recipe
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecipes.map((recipe) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="block p-4 rounded-lg transition-colors"
                  style={{ backgroundColor: 'var(--bg-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-primary)')}
                >
                  <h3 className="font-semibold">{recipe.recipeName}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{recipe.style}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update remaining pages**

Apply the same pattern to all other pages. Key replacements:
- `bg-brewery-black` → `style={{ backgroundColor: 'var(--bg-primary)' }}`
- `bg-brewery-dark` → `style={{ backgroundColor: 'var(--bg-secondary)' }}`
- `text-white` → `style={{ color: 'var(--text-primary)' }}`
- `text-gray-400` → `style={{ color: 'var(--text-secondary)' }}`
- `text-gray-500` → `style={{ color: 'var(--text-muted)' }}`
- `bg-gray-800/50` → use `card-theme` class
- `border-gray-700/50` → removed (handled by `card-theme`)
- `bg-amber-600` → `style={{ backgroundColor: 'var(--accent-primary)' }}`
- `text-amber-400` → `style={{ color: 'var(--accent-primary)' }}`

For the AppLayout, update `bg-brewery-black` to theme variable.

- [ ] **Step 3: Run full test suite**

Run: `cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -30`
Expected: All tests pass (some may need updating)

- [ ] **Step 4: Fix any failing tests**

If tests fail due to color/className changes, update the test assertions to match new theme-aware classes or inline styles.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ frontend/src/components/Layout/AppLayout.tsx
git commit -m "feat(theme): update all pages to use CSS variable theme system"
```

---

### Task 9: Integration Tests + Verification

**Files:**
- Create or modify: `frontend/__tests__/ThemeContext.test.tsx`
- Create or modify: `frontend/__tests__/ThemeToggle.test.tsx`

- [ ] **Step 1: Write ThemeContext tests**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-high-contrast');
  });

  it('defaults to dark theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe('dark');
    expect(result.current.resolvedTheme).toBe('dark');
  });

  it('applies theme class to html element', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setTheme('light');
    });
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
  });

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => {
      result.current.setTheme('high-contrast');
    });
    expect(localStorage.getItem('brewbuddy-theme')).toBe('high-contrast');
  });

  it('cycles through themes in order', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    // Starts at dark
    expect(result.current.theme).toBe('dark');
    act(() => { result.current.cycleTheme(); });
    expect(result.current.theme).toBe('light');
    act(() => { result.current.cycleTheme(); });
    expect(result.current.theme).toBe('high-contrast');
    act(() => { result.current.cycleTheme(); });
    expect(result.current.theme).toBe('system');
    act(() => { result.current.cycleTheme(); });
    expect(result.current.theme).toBe('dark');
  });
});
```

- [ ] **Step 2: Write ThemeToggle tests**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ThemeToggle } from '../src/components/Navbar/ThemeToggle';

const renderToggle = () =>
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders with default dark theme icon', () => {
    renderToggle();
    const button = screen.getByRole('button');
    expect(button.textContent).toBe('🌙');
  });

  it('cycles theme on click', () => {
    renderToggle();
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(button.textContent).toBe('☀️'); // light
    fireEvent.click(button);
    expect(button.textContent).toBe('◐'); // high-contrast
    fireEvent.click(button);
    expect(button.textContent).toBe('💻'); // system
  });

  it('has accessible aria-label', () => {
    renderToggle();
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toContain('Dark Mode');
  });
});
```

- [ ] **Step 3: Run all tests**

Run: `cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -30`
Expected: All tests pass including new ThemeContext and ThemeToggle tests

- [ ] **Step 4: Commit**

```bash
git add frontend/__tests__/
git commit -m "test(theme): add ThemeContext and ThemeToggle unit tests"
```

---

### Task 10: Docker Verification + Documentation + VERSION Bump

**Files:**
- Modify: `VERSION`
- Create: `docs/sprints/sprint-6/RESULTS.md`

- [ ] **Step 1: Docker build and verify**

```bash
cd /mnt/c/Users/phili/workspace/brewbuddy
docker compose -f docker-compose.dev.yml up -d --build
```

Wait for all services to be healthy. Verify:
- Frontend loads at http://localhost:5173
- Theme toggle appears in Navbar
- Cycling through themes changes colors
- Hero section is visible on Landing page
- All pages render without errors

- [ ] **Step 2: Run full test suite one final time**

```bash
cd frontend && npx vitest run --reporter=verbose
```

Expected: All tests pass (old + new)

- [ ] **Step 3: Bump VERSION to 0.3.0**

```bash
echo "0.3.0" > VERSION
```

- [ ] **Step 4: Create RESULTS.md**

```markdown
# Sprint 6 Results — Theme Switching + Hero Fix

**Version:** 0.3.0
**Date:** 2026-06-13
**Status:** ✅ COMPLETE

## What Was Built

### Hero Fix
- Removed `opacity-0` dependency from Landing hero
- Hero now uses CSS `animate-fade-in` directly (no JS)
- Gradient orb opacity bumped to 15% for visibility
- Hero is immediately visible on page load

### Theme System
- **4 modes:** Dark (default), Light, High Contrast, System
- CSS custom properties for all theme-sensitive colors
- Tailwind mapped to CSS variables
- Theme persisted in localStorage
- System mode respects `prefers-color-scheme`

### Theme Toggle
- Navbar toggle cycles: Dark → Light → High Contrast → System
- Icons: 🌙 (Dark), ☀️ (Light), ◐ (High Contrast), 💻 (System)
- Accessible with aria-labels
- Tooltip shows current mode

### UI Components Updated
- Button, Card, Input all use theme variables
- Gradient text class is theme-aware
- Hover glow uses theme shadow variables

### All Pages Updated
- Dashboard, Login, Register, RecipeList, RecipeDetail, RecipeForm
- BrewSessionList, BrewSessionDetail, BrewTimer, AppLayout

## Test Results
- **Frontend tests:** 120+ passing (14 new theme tests)
- **Backend tests:** 277 passing (unchanged)
- **Docker:** All services healthy

## Files Changed
- `frontend/src/styles/global.css` — Full theme variable system
- `frontend/tailwind.config.js` — Theme-aware color mapping
- `frontend/src/context/ThemeContext.tsx` — NEW
- `frontend/src/components/Navbar/ThemeToggle.tsx` — NEW
- `frontend/src/App.tsx` — ThemeProvider wrapper
- `frontend/src/components/Layout/Navbar.tsx` — ThemeToggle integration
- `frontend/src/pages/Landing.tsx` — Hero fix + theme variables
- All UI components and pages — Theme variable adoption
- `VERSION` — Bumped to 0.3.0
```

- [ ] **Step 5: Tag sprint-6**

```bash
git add -A
git commit -m "feat(sprint-6): theme switching + hero fix — v0.3.0"
git tag -a sprint-6 -m "Sprint 6: Theme Switching + Hero Fix"
```

- [ ] **Step 6: Merge to main**

```bash
git checkout main
git merge --no-ff sprint-6 -m "Merge sprint-6 into main"
git push origin main --tags
```

---

## Sprint 7 Plan

Sprint 7 (Shared Library + Ratings/Comments) will be written as a separate plan document after Sprint 6 is complete and verified.
