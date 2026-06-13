import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecipeDetail } from '../src/pages/RecipeDetail';
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

const mockGetRecipeById = vi.fn();
vi.mock('../src/services/api', () => ({
  recipeAPI: {
    getRecipeById: (...args: unknown[]) => mockGetRecipeById(...args),
    deleteRecipe: vi.fn(),
  },
}));

const mockRecipe = {
  _id: '1',
  userId: 'user123',
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
  notes: 'A classic American Pale Ale with citrus hop character',
  isPublic: false,
  isArchived: false,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockIngredients = [
  {
    _id: 'ing1',
    recipeId: '1',
    ingredientType: 'grain',
    order: 1,
    name: 'Pale Malt (2-Row)',
    category: 'Base Malt',
    grainWeight: 4.5,
    grainWeightUnit: 'lb',
    lovibond: 2,
  },
  {
    _id: 'ing2',
    recipeId: '1',
    ingredientType: 'hops',
    order: 1,
    name: 'Cascade',
    hopsWeight: 1,
    hopsWeightUnit: 'oz',
    hopAlphaAcid: 5.5,
    hopBoilMinutes: 60,
    hopForm: 'pellet',
  },
  {
    _id: 'ing3',
    recipeId: '1',
    ingredientType: 'yeast',
    order: 1,
    name: 'American Ale',
    strainId: 'WLP001',
    laboratory: 'White Labs',
    yeastPackageCount: 1,
    yeastType: 'ale',
  },
];

describe('RecipeDetail Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetRecipeById.mockResolvedValue({
      data: { recipe: mockRecipe },
    });
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ingredients: mockIngredients }),
    });
  });

  it('renders recipe name and style', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      // "American Pale Ale" appears in both the h1 title and the style paragraph
      expect(screen.getAllByText('American Pale Ale').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('18A')).toBeDefined();
    });
  });

  it('displays recipe stats', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Stats bar uses abbreviated labels: OG, FG, IBU, SRM, ABV
    await waitFor(() => {
      expect(screen.getAllByText('1.055').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1.012').length).toBeGreaterThan(0);
      expect(screen.getAllByText('40.0').length).toBeGreaterThan(0);
      expect(screen.getAllByText('8.0').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5.6%').length).toBeGreaterThan(0);
    });
  });

  it('displays batch info', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Batch Size')).toBeDefined();
      expect(screen.getByText('20 L')).toBeDefined();
      expect(screen.getByText('Boil Time')).toBeDefined();
      expect(screen.getByText('60 min')).toBeDefined();
      expect(screen.getByText('Efficiency')).toBeDefined();
      expect(screen.getByText('75%')).toBeDefined();
    });
  });

  it('displays brewing method', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Brewing method is shown as a badge in the hero section
    await waitFor(() => {
      expect(screen.getByText('All Grain')).toBeDefined();
    });
  });

  it('displays notes', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for recipe to load, then click the Notes tab
    await waitFor(() => {
      expect(screen.getAllByText('American Pale Ale').length).toBeGreaterThanOrEqual(2);
    });

    const notesTab = screen.getByRole('button', { name: /notes/i });
    notesTab.click();

    await waitFor(() => {
      expect(screen.getByText('Brewer Notes')).toBeDefined();
      expect(screen.getByText('A classic American Pale Ale with citrus hop character')).toBeDefined();
    });
  });

  it('displays ingredients', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    // Ingredients tab is active by default
    // "Ingredients" appears as both the tab label and the section heading
    await waitFor(() => {
      expect(screen.getAllByText('Ingredients').length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Pale Malt (2-Row)')).toBeDefined();
      expect(screen.getByText('Cascade')).toBeDefined();
      expect(screen.getByText('American Ale')).toBeDefined();
    });
  });

  it('shows edit and delete buttons for owner', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeDefined();
      expect(screen.getByText('Delete')).toBeDefined();
    });
  });

  it('has back to recipes link', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      const backLink = screen.getByText('Back to Recipes');
      expect(backLink).toBeDefined();
      expect(backLink.getAttribute('href')).toBe('/recipes');
    });
  });

  it('shows loading state initially', () => {
    mockGetRecipeById.mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Loading recipe...')).toBeDefined();
  });

  it('shows error state', async () => {
    mockGetRecipeById.mockRejectedValue({
      response: { data: { message: 'Recipe not found' } },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Recipe not found')).toBeDefined();
      expect(screen.getByText('Try Again')).toBeDefined();
      expect(screen.getByText('Back to Recipes')).toBeDefined();
    });
  });

  it('displays creation date', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Created:/)).toBeDefined();
      expect(screen.getByText(/1\/15\/2024/)).toBeDefined();
    });
  });

  it('displays update date when different from creation', async () => {
    mockGetRecipeById.mockResolvedValue({
      data: { 
        recipe: {
          ...mockRecipe,
          updatedAt: '2024-01-20T15:30:00Z',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Updated:/)).toBeDefined();
      expect(screen.getByText(/1\/20\/2024/)).toBeDefined();
    });
  });

  it('renders with responsive layout classes', async () => {
    render(
      <MemoryRouter initialEntries={['/recipes/1']}>
        <Routes>
          <Route path="/recipes/:id" element={<RecipeDetail />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('American Pale Ale').length).toBeGreaterThanOrEqual(2);
    });

    // The page structure: div.container > div.max-w-4xl > (back link, hero, etc.)
    const backLink = screen.getByText('Back to Recipes');
    const container = backLink.closest('div.max-w-4xl');
    expect(container).not.toBeNull();
  });
});
