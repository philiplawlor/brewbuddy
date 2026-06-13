import { Link } from 'react-router-dom';

export function Landing() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Recipe Management',
      desc: 'Create and manage your beer recipes with detailed ingredients and calculations.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Brew Timer',
      desc: 'Phone-first timer with hop alerts and event logging for brew day.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Session Tracking',
      desc: 'Track every brew session with real-time data and fermentation monitoring.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Smart Calculations',
      desc: 'Automatic OG, FG, IBU, SRM, and ABV calculations for every recipe.',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Hero Section - Visible immediately via CSS animation */}
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

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to{' '}
            <span className="gradient-text">Brew Better</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
            From recipe design to fermentation tracking, BrewBuddy has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative card-theme rounded-2xl p-8 transition-all duration-500"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[var(--accent-primary)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors duration-500"
                  style={{
                    backgroundColor: 'var(--tag-bg)',
                    border: '1px solid var(--tag-border)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Free & Open Source' },
              { value: '12+', label: 'Beer Styles' },
              { value: '5', label: 'Smart Calculations' },
              { value: '24/7', label: 'Brew Day Support' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--accent-primary)' }}>{stat.value}</div>
                <div className="text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-default)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-primary)' }}>
                <span className="font-display font-bold text-white text-sm">B</span>
              </div>
              <span className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>BrewBuddy</span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>Crafted with care for homebrewers</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
