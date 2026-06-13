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
