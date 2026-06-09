import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

const mockGetMe = vi.fn();
const mockLogin = vi.fn();
const mockRegister = vi.fn();

vi.mock('../src/services/api', () => ({
  authAPI: {
    getMe: () => mockGetMe(),
    login: (credentials: { email: string; password: string }) => mockLogin(credentials),
    register: (data: { username: string; email: string; password: string; displayName?: string }) => mockRegister(data),
  },
}));

function TestComponent() {
  const { user, loading, login, register, logout } = useAuth();

  if (loading) {
    return <div data-testid="loading">Loading...</div>;
  }

  if (user) {
    return (
      <div>
        <span data-testid="user-email">{user.email}</span>
        <button onClick={logout} data-testid="logout-button">Logout</button>
      </div>
    );
  }

  return (
    <div>
      <span data-testid="not-authenticated">Not authenticated</span>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })} data-testid="login-button">Login</button>
      <button onClick={() => register({ username: 'testuser', email: 'test@example.com', password: 'password' })} data-testid="register-button">Register</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides loading state initially when token exists', () => {
    localStorage.setItem('token', 'pending-token');
    mockGetMe.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('shows unauthenticated state when no token exists', async () => {
    mockGetMe.mockRejectedValue(new Error('No token'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('not-authenticated')).toBeDefined();
    });
  });

  it('auto-login when valid token exists', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValue({ data: { user: { id: '1', email: 'test@example.com', name: 'Test User' } } });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeDefined();
      expect(screen.getByTestId('user-email').textContent).toBe('test@example.com');
    });
  });

  it('clears token when getMe fails with invalid token', async () => {
    localStorage.setItem('token', 'invalid-token');
    mockGetMe.mockRejectedValue(new Error('Unauthorized'));

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('not-authenticated')).toBeDefined();
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue({
      data: { token: 'new-token', user: { id: '1', email: 'test@example.com', name: 'Test User' } },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('not-authenticated')).toBeDefined();
    });

    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeDefined();
      expect(localStorage.getItem('token')).toBe('new-token');
    });
  });

  it('handles successful registration', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValue({
      data: { token: 'new-token', user: { id: '1', email: 'test@example.com', name: 'Test User' } },
    });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('not-authenticated')).toBeDefined();
    });

    await user.click(screen.getByTestId('register-button'));

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeDefined();
      expect(localStorage.getItem('token')).toBe('new-token');
    });
  });

  it('handles logout', async () => {
    localStorage.setItem('token', 'valid-token');
    mockGetMe.mockResolvedValue({ data: { user: { id: '1', email: 'test@example.com', name: 'Test User' } } });

    render(
      <MemoryRouter>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-email')).toBeDefined();
    });

    const user = userEvent.setup();
    await user.click(screen.getByTestId('logout-button'));

    await waitFor(() => {
      expect(screen.getByTestId('not-authenticated')).toBeDefined();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});
