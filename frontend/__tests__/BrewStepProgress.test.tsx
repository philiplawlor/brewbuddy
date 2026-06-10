import { render, screen } from '@testing-library/react';
import { BrewStepProgress } from '../src/components/BrewStepProgress';

describe('BrewStepProgress', () => {
  const steps = ['mash', 'boil', 'whirlpool', 'cool'];

  it('should render all steps', () => {
    render(<BrewStepProgress steps={steps} currentStep={0} />);

    expect(screen.getByText('mash')).toBeInTheDocument();
    expect(screen.getByText('boil')).toBeInTheDocument();
    expect(screen.getByText('whirlpool')).toBeInTheDocument();
    expect(screen.getByText('cool')).toBeInTheDocument();
  });

  it('should mark current step with scale', () => {
    render(<BrewStepProgress steps={steps} currentStep={1} />);

    const boilText = screen.getByText('boil');
    expect(boilText.parentElement?.querySelector('.scale-110')).toBeTruthy();
  });

  it('should mark completed steps with checkmark', () => {
    render(<BrewStepProgress steps={steps} currentStep={2} />);

    // Mash and boil are complete — check for checkmark text
    const circles = screen.getAllByText('✓');
    expect(circles.length).toBe(2);
  });

  it('should render step icons', () => {
    render(<BrewStepProgress steps={steps} currentStep={0} />);

    expect(screen.getByText('🌾')).toBeInTheDocument(); // mash
    expect(screen.getByText('🔥')).toBeInTheDocument(); // boil
    expect(screen.getByText('🌀')).toBeInTheDocument(); // whirlpool
    expect(screen.getByText('❄️')).toBeInTheDocument(); // cool
  });

  it('should render connector lines between steps', () => {
    const { container } = render(
      <BrewStepProgress steps={steps} currentStep={0} />
    );

    // 3 connector lines for 4 steps
    const connectors = container.querySelectorAll('.h-0\\.5');
    expect(connectors.length).toBe(3);
  });
});
