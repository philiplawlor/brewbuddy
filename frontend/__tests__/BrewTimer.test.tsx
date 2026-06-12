import { render, screen } from '@testing-library/react';
import { BrewTimer } from '../src/pages/BrewTimer';

// Mock the hook
vi.mock('../src/hooks/useBrewTimer', () => ({
  useBrewTimer: () => ({
    currentStep: 'BOIL',
    timeRemaining: 3600,
    isRunning: true,
    start: vi.fn(),
    pause: vi.fn(),
    skip: vi.fn(),
  }),
}));

describe('BrewTimer', () => {
  it('should render timer page with step display', () => {
    render(<BrewTimer sessionId="session-1" />);
    expect(screen.getByText('BOIL')).toBeInTheDocument();
    expect(screen.getAllByText('60:00').length).toBeGreaterThan(0);
  });
});