import { render, screen } from '@testing-library/react';
import { StepTimer } from '../src/components/Timer/StepTimer';

describe('StepTimer', () => {
  it('should display current step', () => {
    render(<StepTimer step="BOIL" timeRemaining={3600} isRunning={false} />);
    expect(screen.getByText('BOIL')).toBeInTheDocument();
  });

  it('should format time correctly', () => {
    render(<StepTimer step="BOIL" timeRemaining={3661} isRunning={false} />);
    expect(screen.getByText('61:01')).toBeInTheDocument();
  });

  it('should show pause when running', () => {
    render(<StepTimer step="BOIL" timeRemaining={3600} isRunning={true} onPause={() => {}} />);
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('should show start when paused', () => {
    render(<StepTimer step="BOIL" timeRemaining={3600} isRunning={false} onStart={() => {}} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
});
