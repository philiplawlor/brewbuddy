# Sprint 5: UI/UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform BrewBuddy from plain HTML links into a stunning, production-grade brewing assistant with a distinctive craft brewery aesthetic.

**Architecture:** Complete UI redesign using Tailwind CSS with custom theme, dark mode, amber/copper accents, and industrial craft brewery aesthetic. All pages get proper layouts, components, animations, and responsive design.

**Tech Stack:** React, TypeScript, Tailwind CSS (extended), Framer Motion (animations), Lucide React (icons)

---

## Design Direction: Craft Brewery Taproom 🍺

### Aesthetic
- **Theme:** Dark mode with warm amber/copper accents
- **Typography:** Bold display fonts, clean body text
- **Colors:** Deep blacks, rich ambers, copper highlights, cream whites
- **Vibe:** Industrial craft brewery taproom — rugged, authentic, premium

### Color Palette
```css
--color-bg-primary: #0a0a0a;        /* Deep black */
--color-bg-secondary: #1a1a1a;      /* Dark gray */
--color-bg-card: #2a2a2a;           /* Card background */
--color-accent-primary: #d97706;    /* Amber */
--color-accent-secondary: #b45309;  /* Copper */
--color-text-primary: #fafafa;      /* Cream white */
--color-text-secondary: #a3a3a3;    /* Gray */
--color-success: #22c55e;           /* Green */
--color-warning: #f59e0b;           /* Yellow */
--color-danger: #ef4444;            /* Red */
```

---

## File Structure

### New Files
- `frontend/tailwind.config.js` — Extended Tailwind config with custom theme
- `frontend/src/styles/global.css` — Global styles, CSS variables, animations
- `frontend/src/components/Layout/AppLayout.tsx` — Main app layout with sidebar
- `frontend/src/components/Layout/Navbar.tsx` — Top navigation bar
- `frontend/src/components/Layout/Sidebar.tsx` — Side navigation
- `frontend/src/components/UI/Button.tsx` — Reusable button component
- `frontend/src/components/UI/Card.tsx` — Card component
- `frontend/src/components/UI/Input.tsx` — Form input component
- `frontend/src/components/UI/Badge.tsx` — Status badge component
- `frontend/src/components/UI/Modal.tsx` — Modal component
- `frontend/src/components/UI/LoadingSpinner.tsx` — Loading indicator
- `frontend/src/components/Home/HeroSection.tsx` — Landing page hero
- `frontend/src/components/Home/FeatureGrid.tsx` — Feature showcase
- `frontend/src/components/Dashboard/StatsCard.tsx` — Dashboard stat cards
- `frontend/src/components/Dashboard/QuickActions.tsx` — Quick action buttons
- `frontend/src/components/Dashboard/RecentActivity.tsx` — Recent activity feed

### Modified Files
- `frontend/src/App.tsx` — Wrap routes in AppLayout
- `frontend/src/pages/Login.tsx` — Redesign with card layout
- `frontend/src/pages/Register.tsx` — Redesign with card layout
- `frontend/src/pages/Dashboard.tsx` — Complete redesign with stats grid
- `frontend/src/pages/RecipeList.tsx` — Card grid layout
- `frontend/src/pages/RecipeDetail.tsx` — Enhanced with tabs
- `frontend/src/pages/RecipeForm.tsx` — Multi-step form
- `frontend/src/pages/BrewSessionList.tsx` — Enhanced cards
- `frontend/src/pages/BrewSessionDetail.tsx` — Timeline redesign
- `frontend/src/pages/BrewTimer.tsx` — Enhanced timer UI

---

## Tasks

### Task 1: Tailwind Configuration & Global Styles

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/styles/global.css`

- [ ] **Step 1: Create extended Tailwind config**

```javascript
// frontend/tailwind.config.js
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
        brewery: {
          black: '#0a0a0a',
          dark: '#1a1a1a',
          card: '#2a2a2a',
          amber: '#d97706',
          copper: '#b45309',
          cream: '#fafafa',
          gray: '#a3a3a3',
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
          '0%': { boxShadow: '0 0 5px rgba(217, 119, 6, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(217, 119, 6, 0.8)' },
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

- [ ] **Step 2: Create global CSS**

```css
/* frontend/src/styles/global.css */
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #1a1a1a;
  --color-bg-card: #2a2a2a;
  --color-accent-primary: #d97706;
  --color-accent-secondary: #b45309;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a3a3a3;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  margin: 0;
  padding: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--color-accent-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-accent-secondary);
}

/* Glass morphism utility */
.glass {
  background: rgba(42, 42, 42, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, #d97706, #b45309);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hover glow effect */
.hover-glow {
  transition: all 0.3s ease;
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(217, 119, 6, 0.4);
  transform: translateY(-2px);
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/tailwind.config.js frontend/src/styles/global.css
git commit -m "feat(sprint-5): add Tailwind config and global styles"
```

---

### Task 2: UI Component Library

**Files:**
- Create: `frontend/src/components/UI/Button.tsx`
- Create: `frontend/src/components/UI/Card.tsx`
- Create: `frontend/src/components/UI/Input.tsx`
- Create: `frontend/src/components/UI/Badge.tsx`

- [ ] **Step 1: Create Button component**

```typescript
// frontend/src/components/UI/Button.tsx
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
  
  const variants = {
    primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/30',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
    ghost: 'bg-transparent hover:bg-white/10 text-white border border-white/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
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

- [ ] **Step 2: Create Card component**

```typescript
// frontend/src/components/UI/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 ${hover ? 'hover-glow cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h3 className={`font-display text-xl font-semibold ${className}`}>{children}</h3>;
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
```

- [ ] **Step 3: Create Input component**

```typescript
// frontend/src/components/UI/Input.tsx
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full bg-gray-800/50 border ${error ? 'border-red-500' : 'border-gray-700/50'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all ${icon ? 'pl-10' : ''} ${className}`}
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
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      <textarea
        className={`w-full bg-gray-800/50 border ${error ? 'border-red-500' : 'border-gray-700/50'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Create Badge component**

```typescript
// frontend/src/components/UI/Badge.tsx
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-700 text-gray-300',
    success: 'bg-green-500/20 text-green-400 border border-green-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/UI/
git commit -m "feat(sprint-5): add UI component library (Button, Card, Input, Badge)"
```

---

### Task 3: App Layout & Navigation

**Files:**
- Create: `frontend/src/components/Layout/AppLayout.tsx`
- Create: `frontend/src/components/Layout/Navbar.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create AppLayout**

```typescript
// frontend/src/components/Layout/AppLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-brewery-black">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create Navbar**

```typescript
// frontend/src/components/Layout/Navbar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/recipes', label: 'Recipes', icon: '📜' },
    { path: '/brew-sessions', label: 'Brew Sessions', icon: '🍺' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brewery-dark/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="text-3xl">🍺</span>
            <span className="font-display text-2xl font-bold gradient-text">BrewBuddy</span>
          </Link>

          {/* Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-amber-600/20 text-amber-400'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
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

- [ ] **Step 3: Update App.tsx to use layout**

```typescript
// frontend/src/App.tsx - Wrap routes in layout
import { AppLayout } from './components/Layout/AppLayout';

// In routes:
<Route element={<AppLayout />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/recipes" element={<RecipeList />} />
  <Route path="/recipes/:id" element={<RecipeDetail />} />
  <Route path="/recipes/new" element={<RecipeForm />} />
  <Route path="/recipes/:id/edit" element={<RecipeForm />} />
  <Route path="/brew-sessions" element={<BrewSessionList />} />
  <Route path="/brew-sessions/:id" element={<BrewSessionDetail />} />
  <Route path="/brew-sessions/:id/timer" element={<BrewTimer sessionId={params.id} />} />
</Route>
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/Layout/ frontend/src/App.tsx
git commit -m "feat(sprint-5): add AppLayout with Navbar"
```

---

### Task 4: Landing Page Redesign

**Files:**
- Modify: `frontend/src/pages/Landing.tsx` (or create if missing)

- [ ] **Step 1: Create stunning landing page**

```typescript
// frontend/src/pages/Landing.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export function Landing() {
  const features = [
    { icon: '📜', title: 'Recipe Management', desc: 'Create and manage your beer recipes with detailed ingredients and calculations.' },
    { icon: '⏱️', title: 'Brew Timer', desc: 'Phone-first timer with hop alerts and event logging for brew day.' },
    { icon: '📊', title: 'Session Tracking', desc: 'Track every brew session with real-time data and fermentation monitoring.' },
    { icon: '🧮', title: 'Smart Calculations', desc: 'Automatic OG, FG, IBU, SRM, and ABV calculations for every recipe.' },
  ];

  return (
    <div className="min-h-screen bg-brewery-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-brewery-black to-brewery-black" />
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            <h1 className="font-display text-6xl md:text-8xl font-bold mb-6">
              <span className="gradient-text">Brew</span>
              <span className="text-white">Buddy</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Your modern brewing assistant. Craft perfect beer with smart recipes, 
              precise timers, and detailed session tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-display font-semibold text-lg rounded-xl transition-all hover-glow"
              >
                Start Brewing
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-display font-semibold text-lg rounded-xl border border-white/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-display text-4xl font-bold text-center mb-12">
          Everything You Need to <span className="gradient-text">Brew Better</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover-glow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>BrewBuddy — Craft Perfect Beer</p>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Update App.tsx route**

```typescript
// Add landing page route
<Route path="/" element={<Landing />} />
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Landing.tsx frontend/src/App.tsx
git commit -m "feat(sprint-5): redesign landing page with hero and features"
```

---

### Task 5: Login & Register Pages

**Files:**
- Modify: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/pages/Register.tsx`

- [ ] **Step 1: Redesign Login page**

```typescript
// frontend/src/pages/Login.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brewery-black flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/10 via-brewery-black to-brewery-black" />
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="text-5xl">🍺</span>
            <span className="font-display text-4xl font-bold gradient-text">BrewBuddy</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold text-center mb-6">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-display font-semibold rounded-lg transition-all hover-glow disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Redesign Register page (similar pattern)**

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Login.tsx frontend/src/pages/Register.tsx
git commit -m "feat(sprint-5): redesign Login and Register pages"
```

---

### Task 6: Dashboard Redesign

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Redesign Dashboard with stats grid**

```typescript
// frontend/src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalRecipes: 0,
    activeSessions: 0,
    completedSessions: 0,
  });
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [recipesRes, sessionsRes] = await Promise.all([
          api.get('/recipes?limit=5'),
          api.get('/brew-sessions?limit=5'),
        ]);
        setRecentRecipes(recipesRes.data.recipes);
        setStats({
          totalRecipes: recipesRes.data.total || recipesRes.data.recipes.length,
          activeSessions: sessionsRes.data.sessions?.filter((s: any) => s.status === 'IN_PROGRESS').length || 0,
          completedSessions: sessionsRes.data.sessions?.filter((s: any) => s.status === 'COMPLETED').length || 0,
        });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const statCards = [
    { label: 'Total Recipes', value: stats.totalRecipes, icon: '📜', color: 'amber' },
    { label: 'Active Brews', value: stats.activeSessions, icon: '🍺', color: 'green' },
    { label: 'Completed', value: stats.completedSessions, icon: '✅', color: 'blue' },
  ];

  return (
    <div className="min-h-screen bg-brewery-black pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">
            Welcome to <span className="gradient-text">BrewBuddy</span>
          </h1>
          <p className="text-gray-400">Your brewing dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover-glow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="font-display text-3xl font-bold">{stat.value}</p>
                </div>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/recipes/new"
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-all hover-glow"
            >
              + New Recipe
            </Link>
            <Link
              to="/brew-sessions"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
            >
              View Brew Sessions
            </Link>
          </div>
        </div>

        {/* Recent Recipes */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Recent Recipes</h2>
            <Link to="/recipes" className="text-amber-400 hover:text-amber-300 text-sm">
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : recentRecipes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No recipes yet</p>
              <Link
                to="/recipes/new"
                className="text-amber-400 hover:text-amber-300"
              >
                Create your first recipe
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRecipes.map((recipe: any) => (
                <Link
                  key={recipe._id}
                  to={`/recipes/${recipe._id}`}
                  className="block p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
                >
                  <h3 className="font-semibold">{recipe.recipeName}</h3>
                  <p className="text-sm text-gray-400">{recipe.style}</p>
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

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat(sprint-5): redesign Dashboard with stats grid and quick actions"
```

---

### Task 7: Recipe Pages Redesign

**Files:**
- Modify: `frontend/src/pages/RecipeList.tsx`
- Modify: `frontend/src/pages/RecipeDetail.tsx`
- Modify: `frontend/src/pages/RecipeForm.tsx`

- [ ] **Step 1-3: Redesign all recipe pages** (similar patterns with card grids, enhanced details, multi-step forms)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Recipe*.tsx
git commit -m "feat(sprint-5): redesign Recipe pages with card grid and enhanced UI"
```

---

### Task 8: Brew Session Pages Redesign

**Files:**
- Modify: `frontend/src/pages/BrewSessionList.tsx`
- Modify: `frontend/src/pages/BrewSessionDetail.tsx`

- [ ] **Step 1-2: Redesign brew session pages** (enhanced cards, timeline redesign)

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BrewSession*.tsx
git commit -m "feat(sprint-5): redesign Brew Session pages"
```

---

### Task 9: Install Dependencies & Verify

**Files:**
- Run: `npm install` in frontend
- Run: Docker verification

- [ ] **Step 1: Install Framer Motion and Lucide React**

```bash
cd frontend
npm install framer-motion lucide-react
```

- [ ] **Step 2: Docker verification**

```bash
docker compose -f docker-compose.dev.yml down
docker compose -f docker-compose.dev.yml up -d --build
```

- [ ] **Step 3: Verify all tests pass**

```bash
docker compose -f docker-compose.dev.yml exec frontend npm test
```

- [ ] **Step 4: Manual smoke test**

- Visit http://localhost:5173 — Landing page should be stunning
- Login/Register should have card layouts
- Dashboard should show stats grid
- All pages should have consistent dark theme

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(sprint-5): install dependencies and verify Docker"
```

---

### Task 10: Documentation & Tagging

- [ ] **Step 1: Create RESULTS.md**

- [ ] **Step 2: Bump VERSION to 0.2.0**

- [ ] **Step 3: Tag sprint-5**

- [ ] **Step 4: Merge to main**

```bash
git tag -a sprint-5 -m "Sprint 5: UI/UX Overhaul"
git checkout main
git merge --no-ff sprint-5 -m "Merge sprint-5: UI/UX Overhaul"
git push origin main --tags
```

---

## Design Principles

1. **Consistent Dark Theme** — All pages use the same color palette
2. **Glass Morphism** — Cards with backdrop blur and subtle borders
3. **Amber Accents** — Warm copper/amber for CTAs and highlights
4. **Typography Hierarchy** — Bold Oswald for headings, clean Inter for body
5. **Micro-interactions** — Hover glows, smooth transitions
6. **Mobile-First** — Responsive grid layouts
