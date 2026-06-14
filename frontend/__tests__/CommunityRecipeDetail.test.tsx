import { render, screen, waitFor } from '@testing-library/react';
import { CommunityRecipeDetail } from '../src/pages/CommunityRecipeDetail';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';

vi.mock('../src/services/api', () => ({
  recipeAPI: {
    getCommunityRecipeById: vi.fn(),
    getRecipeRatings: vi.fn(),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: 'recipe-123' }) };
});

import { recipeAPI } from '../src/services/api';

const mockRecipe = {
  _id: 'recipe-123',
  recipeName: 'Hazy Pale Ale',
  style: 'Pale Ale',
  method: 'all_grain',
  batchSize: 20,
  batchSizeUnit: 'L',
  boilTimeMinutes: 60,
  estimatedOg: 1.055,
  estimatedFg: 1.012,
  estimatedAbv: 5.6,
  estimatedIbu: 35,
  estimatedSrm: 8,
  notes: 'A hazy, juicy pale ale.',
  userId: { _id: 'u1', username: 'brewer1' },
};

const mockRatings = {
  data: { averageRating: 4.2, ratingCount: 8, userRating: null },
};

const mockComments = [
  {
    _id: 'c1',
    userId: { _id: 'u2', username: 'taster1' },
    text: 'Delicious!',
    createdAt: '2026-06-10T00:00:00.000Z',
  },
];

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('CommunityRecipeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (recipeAPI.getCommunityRecipeById as any).mockResolvedValue({
      data: { recipe: mockRecipe, comments: mockComments },
    });
    (recipeAPI.getRecipeRatings as any).mockResolvedValue(mockRatings);
  });

  it('should render loading state initially', () => {
    (recipeAPI.getCommunityRecipeById as any).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<CommunityRecipeDetail />);
    expect(screen.getByText('Loading recipe...')).toBeInTheDocument();
  });

  it('should render recipe name after loading', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('Hazy Pale Ale')).toBeInTheDocument();
    });
  });

  it('should render recipe brewer name', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('by brewer1')).toBeInTheDocument();
    });
  });

  it('should render recipe style', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('Pale Ale')).toBeInTheDocument();
    });
  });

  it('should render recipe stats', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('1.055')).toBeInTheDocument(); // OG
    });
  });

  it('should render recipe notes', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('A hazy, juicy pale ale.')).toBeInTheDocument();
    });
  });

  it('should render comments section', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('Delicious!')).toBeInTheDocument();
    });
  });

  it('should render back to community link', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText(/back to community/i)).toBeInTheDocument();
    });
  });

  it('should display error state on fetch failure', async () => {
    (recipeAPI.getCommunityRecipeById as any).mockRejectedValue({
      response: { data: { error: 'Recipe not found' } },
    });
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('Recipe not found')).toBeInTheDocument();
    });
  });

  it('should render ratings display', async () => {
    renderWithProviders(<CommunityRecipeDetail />);
    await waitFor(() => {
      expect(screen.getByText('8 ratings')).toBeInTheDocument();
    });
  });
});
