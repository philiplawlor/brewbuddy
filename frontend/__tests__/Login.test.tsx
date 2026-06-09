import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from '../src/pages/Login';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    loading: false,
    error: null,
    clearError: vi.fn(),
  }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
  });

  it('displays required field errors when form is submitted empty', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeDefined();
      expect(screen.getByText(/password is required/i)).toBeDefined();
    });
  });

  it('displays email format error for invalid email', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeDefined();
    });
  });

  it('has link to register page', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeDefined();
  });

  it('renders with responsive container classes', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const container = screen.getByText('Welcome Back').closest('div');
    expect(container?.className).toContain('max-w-md');
  });
});
