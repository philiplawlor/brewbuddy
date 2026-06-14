import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecipeList } from '../src/pages/RecipeList';
import { recipeAPI } from '../src/services/api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'test@example.com', name: 'Test User' },
    loading: false,
  }),
}));

const mockGetRecipes = vi.fn();
vi.mock('../src/services/api', () => ({
  recipeAPI: {
    getRecipes: (...args: unknown[]) => mockGetRecipes(...args),
  },
}));

const mockRecipes = [
  {
    _id: '1',
    recipeName: 'American Pale Ale',
    style: 'American Pale Ale',
    styleCode: '18A',
    method: 'all_grain',
    batchSize: 20,
    batchSizeUnit: 'L',
    boilTimeMinutes: 60,
    efficiency: 75,
    estimatedOg: 1.055,
    estimatedFg: 1.012,
    estimatedAbv: 5.6,
    estimatedIbu: 40,
    estimatedSrm: 8,
    notes: 'A classic American Pale Ale',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: '2',
    recipeName: 'Belgian Witbier',
    style: 'Witbier',
    styleCode: '24A',
    method: 'all_grain',
    batchSize: 19,
    batchSizeUnit: 'L',
    boilTimeMinutes: 60,
    efficiency: 72,
    estimatedOg: 1.048,
    estimatedFg: 1.010,
    estimatedAbv: 5.0,
    estimatedIbu: 15,
    estimatedSrm: 3,
    notes: 'A refreshing Belgian wheat beer',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
];

describe('RecipeList Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetRecipes.mockResolvedValue({
      data: {
        recipes: mockRecipes,
        pagination: {
          page: 1,
          limit: 12,
          total: 2,
          pages: 1,
        },
      },
    });
  });

  it('renders recipe list with title', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });
    
    expect(screen.getByText('2 recipes total')).toBeDefined();
  });

  it('displays recipe cards', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getAllByText('American Pale Ale').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Belgian Witbier').length).toBeGreaterThan(0);
    });
  });

  it('displays recipe stats', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    await waitFor(() => {
      // Stats are displayed in abbreviated form on cards: OG, IBU, ABV
      expect(screen.getAllByText('1.055').length).toBeGreaterThan(0);
      expect(screen.getAllByText('40.0').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5.6%').length).toBeGreaterThan(0);
    });
  });

  it('has search input', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    const searchInput = screen.getByPlaceholderText('Search recipes...');
    expect(searchInput).toBeDefined();
  });

  it('filters recipes by search query', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getAllByText('American Pale Ale').length).toBeGreaterThan(0);
    });

    const searchInput = screen.getByPlaceholderText('Search recipes...');
    fireEvent.change(searchInput, { target: { value: 'Wit' } });

    await waitFor(() => {
      const grid = document.querySelector('.grid.grid-cols-1');
      const recipeCards = grid ? grid.querySelectorAll('a') : [];
      const paleAleCards = Array.from(recipeCards).filter(el =>
        el.textContent?.includes('American Pale Ale')
      );
      expect(paleAleCards.length).toBe(0);
      expect(screen.getByText('Belgian Witbier')).toBeDefined();
    });
  });

  it('has sort dropdown', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    const sortSelect = screen.getAllByLabelText('Sort By')[0];
    expect(sortSelect).toBeDefined();
  });

  it('has new recipe button', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    const newRecipeLink = screen.getByText('New Recipe');
    expect(newRecipeLink).toBeDefined();
  });

  it('shows import button linking to import page', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    const importLink = screen.getByText('Import');
    expect(importLink).toBeDefined();
  });

  it('links recipe cards to detail page', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    await waitFor(() => {
      const paleAleLink = screen.getByRole('link', { name: /american pale ale/i });
      expect(paleAleLink.getAttribute('href')).toBe('/recipes/1');
    });
  });

  it('shows loading state initially', () => {
    mockGetRecipes.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading recipes...')).toBeDefined();
  });

  it('shows error state', async () => {
    mockGetRecipes.mockRejectedValue({
      response: { data: { message: 'Failed to load recipes' } },
    });

    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to load recipes')).toBeDefined();
      expect(screen.getByText('Try Again')).toBeDefined();
    });
  });

  it('shows empty state when no recipes', async () => {
    mockGetRecipes.mockResolvedValue({
      data: {
        recipes: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          pages: 0,
        },
      },
    });

    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No recipes found')).toBeDefined();
      expect(screen.getByText("You haven't created any recipes yet.")).toBeDefined();
      expect(screen.getByText('Create Your First Recipe')).toBeDefined();
    });
  });

  it('has style filter dropdown', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    const styleSelect = screen.getAllByLabelText('Style')[0];
    expect(styleSelect).toBeDefined();
  });

  it('has method filter dropdown', async () => {
    render(
      <MemoryRouter>
        <RecipeList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipes')).toBeDefined();
    });

    const methodSelect = screen.getAllByLabelText('Method')[0];
    expect(methodSelect).toBeDefined();
  });
});