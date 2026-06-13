import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders the home page with BrewBuddy title', () => {
    render(<App />);
    
    const title = screen.getByText('BrewBuddy');
    expect(title).toBeInTheDocument();
  });

  it('renders login and register buttons on home page', () => {
    render(<App />);
    
    const loginButton = screen.getByText('Sign In');
    const registerButton = screen.getByText('Start Brewing');
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<App />);
    
    const tagline = screen.getByText(/Your modern brewing assistant/);
    expect(tagline).toBeInTheDocument();
  });
});
