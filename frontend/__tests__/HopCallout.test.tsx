import { render, screen } from '@testing-library/react';
import { HopCallout } from '../src/components/Timer/HopCallout';

describe('HopCallout', () => {
  it('should show next hop details', () => {
    const hop = { time: 15, name: 'Citra', amount: 1, unit: 'oz' };
    render(<HopCallout nextHop={hop} timeUntilHop={900} />);
    expect(screen.getByText(/Citra/)).toBeInTheDocument();
    expect(screen.getByText(/1 oz/)).toBeInTheDocument();
  });

  it('should show time until hop', () => {
    const hop = { time: 15, name: 'Citra', amount: 1, unit: 'oz' };
    render(<HopCallout nextHop={hop} timeUntilHop={900} />);
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('should show alert state when hop is due', () => {
    const hop = { time: 15, name: 'Citra', amount: 1, unit: 'oz' };
    render(<HopCallout nextHop={hop} timeUntilHop={0} />);
    expect(screen.getByText('ADD NOW!')).toBeInTheDocument();
  });
});
