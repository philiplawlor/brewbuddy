import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BrewSessionCard } from '../src/components/BrewSessionCard';
import { BrewSession } from '../src/types';

const mockSession: BrewSession = {
  _id: 'session-123',
  userId: 'user-123',
  recipeId: {
    _id: 'recipe-456',
    recipeName: 'Test IPA',
    style: 'American IPA',
  } as any,
  batchNumber: 'B-2026-001',
  sessionName: 'Brew Day #1',
  brewDate: '2026-06-15T00:00:00.000Z',
  status: 'in_progress',
  batchSize: 20,
  batchSizeUnit: 'L',
  method: 'all_grain',
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('BrewSessionCard', () => {
  it('should render session name and recipe name', () => {
    renderWithRouter(<BrewSessionCard session={mockSession} />);

    expect(screen.getByText('Brew Day #1')).toBeInTheDocument();
    expect(screen.getByText('Test IPA')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    renderWithRouter(<BrewSessionCard session={mockSession} />);

    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('should render brew date', () => {
    renderWithRouter(<BrewSessionCard session={mockSession} />);

    expect(screen.getByText(/6\/1[45]\/2026/)).toBeInTheDocument();
  });

  it('should render batch number', () => {
    renderWithRouter(<BrewSessionCard session={mockSession} />);

    expect(screen.getByText('B-2026-001')).toBeInTheDocument();
  });

  it('should render recipe style', () => {
    renderWithRouter(<BrewSessionCard session={mockSession} />);

    expect(screen.getByText('American IPA')).toBeInTheDocument();
  });

  it('should render actual readings when present', () => {
    const sessionWithReadings = {
      ...mockSession,
      actualOg: 1.065,
      actualAbv: 6.5,
    };
    renderWithRouter(<BrewSessionCard session={sessionWithReadings} />);

    expect(screen.getByText('1.065')).toBeInTheDocument();
    expect(screen.getByText('6.5%')).toBeInTheDocument();
  });

  it('should link to session detail page', () => {
    renderWithRouter(<BrewSessionCard session={mockSession} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/brew-sessions/session-123');
  });

  it('should handle recipeId as string', () => {
    const sessionWithStringRecipe = {
      ...mockSession,
      recipeId: 'recipe-456',
    };
    renderWithRouter(<BrewSessionCard session={sessionWithStringRecipe} />);

    expect(screen.getByText('Unknown Recipe')).toBeInTheDocument();
  });
});
