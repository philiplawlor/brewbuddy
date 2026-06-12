import { render, screen } from '@testing-library/react';
import { UpcomingSteps } from '../src/components/Timer/UpcomingSteps';

describe('UpcomingSteps', () => {
  it('should display upcoming steps', () => {
    render(<UpcomingSteps currentStep="BOIL" />);
    expect(screen.getByText('Whirlpool')).toBeInTheDocument();
    expect(screen.getByText('Cool & Transfer')).toBeInTheDocument();
  });

  it('should highlight next step', () => {
    const { container } = render(<UpcomingSteps currentStep="MASH" />);
    const items = container.querySelectorAll('.flex.items-center');
    expect(items[0]).toHaveClass('opacity-100');
  });
});
