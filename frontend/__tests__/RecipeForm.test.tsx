import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecipeForm } from '../src/pages/RecipeForm';
import { recipeAPI } from '../src/services/api';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'test@example.com', name: 'Test User' },
    loading: false,
  }),
}));

const mockNavigate = vi.fn();
const mockParams: { id?: string } = {};

const mockCreateRecipe = vi.fn();
const mockUpdateRecipe = vi.fn();
const mockGetRecipeById = vi.fn();

vi.mock('../src/services/api', () => ({
  recipeAPI: {
    createRecipe: (...args: unknown[]) => mockCreateRecipe(...args),
    updateRecipe: (...args: unknown[]) => mockUpdateRecipe(...args),
    getRecipeById: (...args: unknown[]) => mockGetRecipeById(...args),
  },
}));

const mockRecipe = {
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
  estimatedCalories: 180,
  notes: 'A classic American Pale Ale',
  isPublic: true,
};

const renderForm = (params: { id?: string } = {}) => {
  Object.assign(mockParams, params);
  // Clear id if not provided
  if (!params.id) {
    delete mockParams.id;
  }
  return render(
    <MemoryRouter initialEntries={[params.id ? `/recipes/${params.id}/edit` : '/recipes/new']}>
      <Routes>
        <Route path="/recipes/new" element={<RecipeForm />} />
        <Route path="/recipes/:id/edit" element={<RecipeForm />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('RecipeForm Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetRecipeById.mockResolvedValue({ data: { recipe: mockRecipe } });
    mockCreateRecipe.mockResolvedValue({ data: { recipe: { ...mockRecipe, _id: '2' } } });
    mockUpdateRecipe.mockResolvedValue({ data: { recipe: mockRecipe } });
  });

  describe('Create Mode', () => {
    it('renders create form with title', async () => {
      renderForm();
      expect(screen.getByText('Create New Recipe')).toBeDefined();
    });

    it('has recipe name input', async () => {
      renderForm();
      const nameInput = screen.getByLabelText(/recipe name/i);
      expect(nameInput).toBeDefined();
    });

    it('has style input', async () => {
      renderForm();
      const styleInput = screen.getByLabelText(/style$/i);
      expect(styleInput).toBeDefined();
    });

    it('has style code input', async () => {
      renderForm();
      const styleCodeInput = screen.getByLabelText(/style code/i);
      expect(styleCodeInput).toBeDefined();
    });

    it('has method dropdown', async () => {
      renderForm();
      const methodSelect = screen.getByLabelText(/method/i);
      expect(methodSelect).toBeDefined();
    });

    it('has batch size input', async () => {
      renderForm();
      const batchSizeInput = screen.getByLabelText(/batch size/i);
      expect(batchSizeInput).toBeDefined();
    });

    it('has boil time input', async () => {
      renderForm();
      const boilTimeInput = screen.getByLabelText(/boil time/i);
      expect(boilTimeInput).toBeDefined();
    });

    it('has efficiency input', async () => {
      renderForm();
      const efficiencyInput = screen.getByLabelText(/efficiency/i);
      expect(efficiencyInput).toBeDefined();
    });

    it('has notes textarea', async () => {
      renderForm();
      const notesTextarea = screen.getByLabelText(/notes/i);
      expect(notesTextarea).toBeDefined();
    });

    it('has add grain button', async () => {
      renderForm();
      const addGrainButton = screen.getByText('+ Add Grain');
      expect(addGrainButton).toBeDefined();
    });

    it('has add hop button', async () => {
      renderForm();
      const addHopButton = screen.getByText('+ Add Hop');
      expect(addHopButton).toBeDefined();
    });

    it('has add yeast button', async () => {
      renderForm();
      const addYeastButton = screen.getByText('+ Add Yeast');
      expect(addYeastButton).toBeDefined();
    });

    it('shows calculated stats section', async () => {
      renderForm();
      expect(screen.getByText('Calculated Stats')).toBeDefined();
      expect(screen.getByText('OG')).toBeDefined();
      expect(screen.getByText('FG')).toBeDefined();
      expect(screen.getByText('ABV')).toBeDefined();
    });

    it('has save button', async () => {
      renderForm();
      const saveButton = screen.getByText('Save Recipe');
      expect(saveButton).toBeDefined();
    });
  });

  describe('Edit Mode', () => {
    it('renders edit form with title', async () => {
      renderForm({ id: '1' });
      await waitFor(() => {
        expect(screen.getByText('Edit Recipe')).toBeDefined();
      });
    });

    it('loads existing recipe data', async () => {
      renderForm({ id: '1' });
      await waitFor(() => {
        expect(screen.getByDisplayValue('18A')).toBeDefined();
      });
    });

    it('populates style field', async () => {
      renderForm({ id: '1' });
      await waitFor(() => {
        const styleInput = screen.getByLabelText('Style');
        expect(styleInput).toHaveValue('American Pale Ale');
      });
    });

    it('populates style code field', async () => {
      renderForm({ id: '1' });
      await waitFor(() => {
        expect(screen.getByDisplayValue('18A')).toBeDefined();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows error when submitting without name', async () => {
      const user = userEvent.setup();
      renderForm();
      
      const saveButton = screen.getByText('Save Recipe');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText('Recipe name is required')).toBeDefined();
      });
    });

    it('does not call API when validation fails', async () => {
      const user = userEvent.setup();
      renderForm();
      
      const saveButton = screen.getByText('Save Recipe');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockCreateRecipe).not.toHaveBeenCalled();
      });
    });
  });

  describe('Dynamic Ingredients', () => {
    it('adds a grain row when clicking add grain', async () => {
      const user = userEvent.setup();
      renderForm();
      
      const addGrainButton = screen.getByText('+ Add Grain');
      await user.click(addGrainButton);
      
      expect(screen.getByLabelText(/grain name/i)).toBeDefined();
      expect(screen.getByLabelText(/weight/i)).toBeDefined();
    });

    it('removes a grain row when clicking remove', async () => {
      const user = userEvent.setup();
      renderForm();
      
      const addGrainButton = screen.getByText('+ Add Grain');
      await user.click(addGrainButton);
      
      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);
      
      expect(screen.queryByLabelText(/grain name/i)).toBeNull();
    });

    it('adds a hop row when clicking add hop', async () => {
      const user = userEvent.setup();
      renderForm();
      
      const addHopButton = screen.getByText('+ Add Hop');
      await user.click(addHopButton);
      
      expect(screen.getByLabelText(/hop name/i)).toBeDefined();
    });

    it('adds a yeast row when clicking add yeast', async () => {
      const user = userEvent.setup();
      renderForm();
      
      const addYeastButton = screen.getByText('+ Add Yeast');
      await user.click(addYeastButton);
      
      expect(screen.getByLabelText(/yeast name/i)).toBeDefined();
    });

    it('allows multiple grains', async () => {
      const user = userEvent.setup();
      renderForm();
      
      const addGrainButton = screen.getByText('+ Add Grain');
      await user.click(addGrainButton);
      await user.click(addGrainButton);
      
      const grainNameInputs = screen.getAllByLabelText(/grain name/i);
      expect(grainNameInputs.length).toBe(2);
    });
  });

  describe('Form Submission', () => {
    it('calls createRecipe API on submit for new recipe', async () => {
      const user = userEvent.setup();
      renderForm();
      
      await user.type(screen.getByLabelText(/recipe name/i), 'Test IPA');
      await user.type(screen.getByLabelText(/style$/i), 'IPA');
      
      const saveButton = screen.getByText('Save Recipe');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockCreateRecipe).toHaveBeenCalled();
      });
    });

    it('navigates to recipe list after successful creation', async () => {
      const user = userEvent.setup();
      renderForm();
      
      await user.type(screen.getByLabelText(/recipe name/i), 'Test IPA');
      
      const saveButton = screen.getByText('Save Recipe');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/recipes');
      });
    });

    it('calls updateRecipe API on submit for existing recipe', async () => {
      const user = userEvent.setup();
      renderForm({ id: '1' });
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('18A')).toBeDefined();
      });
      
      const saveButton = screen.getByText('Save Recipe');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateRecipe).toHaveBeenCalledWith('1', expect.any(Object));
      });
    });
  });

  describe('RecipeStats', () => {
    it('displays default values when no ingredients', async () => {
      renderForm();
      expect(screen.getByText('OG')).toBeDefined();
      expect(screen.getAllByText('1.000').length).toBeGreaterThan(0);
      expect(screen.getByText('FG')).toBeDefined();
      expect(screen.getByText('ABV')).toBeDefined();
    });
  });
});
