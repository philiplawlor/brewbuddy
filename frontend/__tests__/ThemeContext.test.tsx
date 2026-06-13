import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, useTheme, getThemeIcon, getThemeLabel } from '../src/context/ThemeContext';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
const matchMediaMock = {
  matches: false,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    ...matchMediaMock,
    matches: query === '(prefers-color-scheme: light)' ? matchMediaMock.matches : false,
  })),
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.className = '';
  });

  describe('useTheme', () => {
    it('should return default theme (dark) when no stored theme', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
    });

    it('should return stored theme from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should set theme and update localStorage', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      act(() => {
        result.current.setTheme('light');
      });
      
      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('brewbuddy-theme', 'light');
    });

    it('should cycle through themes in order', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      // Start at dark (default)
      expect(result.current.theme).toBe('dark');
      
      // Cycle to light
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe('light');
      
      // Cycle to high-contrast
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe('high-contrast');
      
      // Cycle to system
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe('system');
      
      // Cycle back to dark
      act(() => {
        result.current.cycleTheme();
      });
      expect(result.current.theme).toBe('dark');
    });

    it('should apply theme class to document root', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      act(() => {
        result.current.setTheme('light');
      });
      
      expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    });

    it('should resolve system theme based on OS preference', () => {
      localStorageMock.getItem.mockReturnValue('system');
      matchMediaMock.matches = true; // OS prefers light
      
      const { result } = renderHook(() => useTheme(), { wrapper });
      
      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('light');
    });

    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('getThemeIcon', () => {
    it('should return correct icon for each theme', () => {
      expect(getThemeIcon('dark')).toBe('🌙');
      expect(getThemeIcon('light')).toBe('☀️');
      expect(getThemeIcon('high-contrast')).toBe('◐');
      expect(getThemeIcon('system')).toBe('💻');
    });
  });

  describe('getThemeLabel', () => {
    it('should return correct label for each theme', () => {
      expect(getThemeLabel('dark')).toBe('Dark Mode');
      expect(getThemeLabel('light')).toBe('Light Mode');
      expect(getThemeLabel('high-contrast')).toBe('High Contrast');
      expect(getThemeLabel('system')).toBe('System');
    });
  });
});
