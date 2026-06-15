import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      await authAPI.forgotPassword(email);
      setStatus('success');
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
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Reset your password</p>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '12px', padding: '32px', border: '1px solid var(--border)' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
              <h2 style={{ color: 'var(--text)', fontSize: '20px', margin: '0 0 16px 0' }}>Check your email</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                If an account exists with <strong style={{ color: 'var(--text)' }}>{email}</strong>, we've sent a password reset link.
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
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: 'var(--text)', marginBottom: '8px', fontWeight: '500' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  placeholder="you@example.com"
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
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPassword;
