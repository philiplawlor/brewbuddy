import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    hero.classList.add('animate-fade-in');
  }, []);

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
    <div className="min-h-screen bg-brewery-black text-white overflow-hidden">
      {/* Hero Section */}
      <div ref={heroRef} className="relative opacity-0">
        {/* Animated background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-amber-600/5 to-transparent rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-600/30 bg-amber-600/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-amber-400 text-sm font-medium tracking-wide uppercase">Open Source Brewing</span>
            </div>

            {/* Title */}
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold mb-6 tracking-tight">
              <span className="text-white">Brew</span>
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">Buddy</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Your modern brewing assistant. Craft perfect beer with smart recipes, 
              precise timers, and detailed session tracking.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-display font-semibold text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(217,119,6,0.3)]"
              >
                <span className="relative z-10">Start Brewing</span>
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-display font-semibold text-lg rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
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
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Brew Better</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            From recipe design to fermentation tracking, BrewBuddy has you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-brewery-dark/80 backdrop-blur-sm border border-white/5 rounded-2xl p-8 hover:border-amber-600/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(217,119,6,0.1)]"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center text-amber-500 mb-5 group-hover:bg-amber-600/20 transition-colors duration-500">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100%', label: 'Free & Open Source' },
              { value: '12+', label: 'Beer Styles' },
              { value: '5', label: 'Smart Calculations' },
              { value: '24/7', label: 'Brew Day Support' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-display text-3xl md:text-4xl font-bold text-amber-500 mb-2">{stat.value}</div>
                <div className="text-gray-500 text-sm uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">B</span>
              </div>
              <span className="font-display font-semibold text-white">BrewBuddy</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
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
