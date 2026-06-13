import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ThemeToggle } from '../src/components/Navbar/ThemeToggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    document.documentElement.className = '';
  });

  it('should render with default theme icon', () => {
    render(<ThemeToggle />, { wrapper });
    
    // Default theme is dark, so should show moon icon
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should have correct aria-label', () => {
    render(<ThemeToggle />, { wrapper });
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Current theme: Dark Mode. Click to cycle themes.');
  });

  it('should cycle theme on click', () => {
    render(<ThemeToggle />, { wrapper });
    
    const button = screen.getByRole('button');
    
    // Click to cycle from dark to light
    fireEvent.click(button);
    
    // Should now show light theme icon
    expect(screen.getByText('☀️')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Current theme: Light Mode. Click to cycle themes.');
  });

  it('should cycle through all themes', () => {
    render(<ThemeToggle />, { wrapper });
    
    const button = screen.getByRole('button');
    
    // Dark -> Light
    fireEvent.click(button);
    expect(screen.getByText('☀️')).toBeInTheDocument();
    
    // Light -> High Contrast
    fireEvent.click(button);
    expect(screen.getByText('◐')).toBeInTheDocument();
    
    // High Contrast -> System
    fireEvent.click(button);
    expect(screen.getByText('💻')).toBeInTheDocument();
    
    // System -> Dark
    fireEvent.click(button);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should have hover effect class', () => {
    render(<ThemeToggle />, { wrapper });
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-[var(--bg-secondary)]');
  });
});
