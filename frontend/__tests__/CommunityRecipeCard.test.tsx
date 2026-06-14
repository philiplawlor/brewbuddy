import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CommunityRecipeCard } from '../src/components/CommunityRecipeCard';

const mockRecipe = {
  _id: 'r1',
  recipeName: 'Hop Bomb IPA',
  style: 'American IPA',
  method: 'all_grain',
  averageRating: 4.5,
  ratingCount: 12,
  userId: { _id: 'u1', username: 'brewer1' },
};

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('CommunityRecipeCard', () => {
  it('should render recipe name', () => {
    renderWithRouter(<CommunityRecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('Hop Bomb IPA')).toBeInTheDocument();
  });

  it('should render brewer username', () => {
    renderWithRouter(<CommunityRecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('by brewer1')).toBeInTheDocument();
  });

  it('should render style tag', () => {
    renderWithRouter(<CommunityRecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('American IPA')).toBeInTheDocument();
  });

  it('should render method tag', () => {
    renderWithRouter(<CommunityRecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('all grain')).toBeInTheDocument();
  });

  it('should render average rating', () => {
    renderWithRouter(<CommunityRecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should render rating count', () => {
    renderWithRouter(<CommunityRecipeCard recipe={mockRecipe} />);
    expect(screen.getByText('(12 ratings)')).toBeInTheDocument();
  });

  it('should link to community recipe detail', () => {
    renderWithRouter(<CommunityRecipeCard recipe={mockRecipe} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/community/recipe/r1');
  });

  it('should handle zero ratings gracefully', () => {
    const noRatingRecipe = { ...mockRecipe, averageRating: 0, ratingCount: 0 };
    renderWithRouter(<CommunityRecipeCard recipe={noRatingRecipe} />);
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('(0 ratings)')).toBeInTheDocument();
  });

  it('should show singular rating when count is 1', () => {
    const oneRating = { ...mockRecipe, ratingCount: 1 };
    renderWithRouter(<CommunityRecipeCard recipe={oneRating} />);
    expect(screen.getByText('(1 rating)')).toBeInTheDocument();
  });

  it('should show Unknown Brewer when userId is missing username', () => {
    const noUsername = { ...mockRecipe, userId: { _id: 'u1' } as any };
    renderWithRouter(<CommunityRecipeCard recipe={noUsername} />);
    expect(screen.getByText('by Unknown Brewer')).toBeInTheDocument();
  });
});
