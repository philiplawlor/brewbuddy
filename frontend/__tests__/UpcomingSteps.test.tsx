import { render, screen } from '@testing-library/react';
import { UpcomingSteps } from '../src/components/Timer/UpcomingSteps';

describe('UpcomingSteps', () => {
  it('should display upcoming steps', () => {
    render(<UpcomingSteps currentStep="BOIL" />);
    expect(screen.getByText('Whirlpool')).toBeInTheDocument();
    expect(screen.getByText('Cool & Transfer')).toBeInTheDocument();
  });

  it('should highlight next step', () => {
    render(<UpcomingSteps currentStep="MASH" />);
    expect(screen.getByText('Boil')).toHaveClass('opacity-100');
  });
});
