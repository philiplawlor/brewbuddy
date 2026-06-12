import { render, screen, fireEvent } from '@testing-library/react';
import { EventLogger } from '../src/components/Timer/EventLogger';

describe('EventLogger', () => {
  it('should show FAB button', () => {
    render(<EventLogger onLogEvent={() => {}} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('should open modal on FAB click', () => {
    render(<EventLogger onLogEvent={() => {}} />);
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('Log Event')).toBeInTheDocument();
  });

  it('should show event types', () => {
    render(<EventLogger onLogEvent={() => {}} />);
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText(/Gravity/)).toBeInTheDocument();
    expect(screen.getByText(/Temperature/)).toBeInTheDocument();
    expect(screen.getByText(/Notes/)).toBeInTheDocument();
  });
});
