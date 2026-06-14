import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Community } from '../src/pages/Community';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';

vi.mock('../src/services/api', () => ({
  recipeAPI: {
    getCommunityRecipes: vi.fn(),
  },
}));

import { recipeAPI } from '../src/services/api';

const mockRecipes = [
  {
    _id: 'r1',
    recipeName: 'Hop Bomb IPA',
    style: 'American IPA',
    method: 'all_grain',
    averageRating: 4.5,
    ratingCount: 12,
    userId: { _id: 'u1', username: 'brewer1' },
  },
  {
    _id: 'r2',
    recipeName: 'Dark Stout',
    style: 'Stout',
    method: 'extract',
    averageRating: 3.8,
    ratingCount: 5,
    userId: { _id: 'u2', username: 'brewer2' },
  },
];

const mockResponse = {
  data: {
    recipes: mockRecipes,
    pagination: { page: 1, limit: 12, total: 2, pages: 1 },
  },
};

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Community Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (recipeAPI.getCommunityRecipes as any).mockResolvedValue(mockResponse);
  });

  it('should render page title', async () => {
    renderWithProviders(<Community />);
    expect(screen.getByText('Community Recipes')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderWithProviders(<Community />);
    expect(screen.getByPlaceholderText('Search recipes...')).toBeInTheDocument();
  });

  it('should render style filter dropdown', () => {
    renderWithProviders(<Community />);
    expect(screen.getByText('All Styles')).toBeInTheDocument();
  });

  it('should render sort dropdown', () => {
    renderWithProviders(<Community />);
    expect(screen.getByText('Highest Rated')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    (recipeAPI.getCommunityRecipes as any).mockReturnValue(new Promise(() => {})); // never resolves
    renderWithProviders(<Community />);
    expect(screen.getByText('Loading community recipes...')).toBeInTheDocument();
  });

  it('should display recipes after loading', async () => {
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('Hop Bomb IPA')).toBeInTheDocument();
    });
    expect(screen.getByText('Dark Stout')).toBeInTheDocument();
  });

  it('should display error message on fetch failure', async () => {
    (recipeAPI.getCommunityRecipes as any).mockRejectedValue({
      response: { data: { error: 'Network error' } },
    });
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should call API with search params', async () => {
    renderWithProviders(<Community />);
    const searchInput = screen.getByPlaceholderText('Search recipes...');
    fireEvent.change(searchInput, { target: { value: 'IPA' } });

    await waitFor(() => {
      expect(recipeAPI.getCommunityRecipes).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'IPA' })
      );
    });
  });

  it('should show empty state when no recipes', async () => {
    (recipeAPI.getCommunityRecipes as any).mockResolvedValue({
      data: { recipes: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } },
    });
    renderWithProviders(<Community />);
    await waitFor(() => {
      expect(screen.getByText(/no shared recipes yet/i)).toBeInTheDocument();
    });
  });

  it('should call API with sort param', async () => {
    renderWithProviders(<Community />);
    const sortSelect = screen.getByDisplayValue('Highest Rated');
    fireEvent.change(sortSelect, { target: { value: 'newest' } });

    await waitFor(() => {
      expect(recipeAPI.getCommunityRecipes).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'newest' })
      );
    });
  });
});
