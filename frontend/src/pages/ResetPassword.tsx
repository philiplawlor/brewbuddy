import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ color: 'var(--text)', margin: '0 0 16px 0' }}>Invalid Reset Link</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This password reset link is invalid or missing a token.</p>
          <Link
            to="/forgot-password"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--amber)',
              color: 'var(--bg)',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: '600',
            }}
          >
            Request a New Link
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await authAPI.resetPassword(token, password);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ color: 'var(--amber)', fontSize: '28px', margin: '0 0 8px 0' }}>🍺 BrewBuddy</h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Create a new password</p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ color: 'var(--text)', fontSize: '20px', margin: '0 0 16px 0' }}>Password Reset!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                Your password has been updated. Redirecting to login...
              </p>
              <Link
                to="/login"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--amber)',
                  color: 'var(--bg)',
                  textDecoration: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                }}
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text)', marginBottom: '8px', fontWeight: '500' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="At least 6 characters"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text)', marginBottom: '8px', fontWeight: '500' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '16px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Re-enter your password"
                />
              </div>

              {status === 'error' && (
                <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--amber)',
                  color: 'var(--bg)',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? 'Resetting...' : 'Reset Password'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" style={{ color: 'var(--amber)', textDecoration: 'none', fontSize: '14px' }}>
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
