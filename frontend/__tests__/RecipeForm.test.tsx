import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

/** Navigate to a specific step by clicking "Next Step" the appropriate number of times */
const navigateToStep = async (user: ReturnType<typeof userEvent.setup>, stepIndex: number) => {
  for (let i = 0; i < stepIndex; i++) {
    const nextButton = screen.getByText('Next Step');
    await user.click(nextButton);
  }
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
      const user = userEvent.setup();
      renderForm();
      // Notes are on step 3 (instructions)
      await navigateToStep(user, 2);
      const notesTextarea = screen.getByLabelText(/notes/i);
      expect(notesTextarea).toBeDefined();
    });

    it('has add grain button', async () => {
      const user = userEvent.setup();
      renderForm();
      // Grains are on step 2 (ingredients)
      await navigateToStep(user, 1);
      const addGrainButton = screen.getByText('Add Grain');
      expect(addGrainButton).toBeDefined();
    });

    it('has add hop button', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      const addHopButton = screen.getByText('Add Hop');
      expect(addHopButton).toBeDefined();
    });

    it('has add yeast button', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      const addYeastButton = screen.getByText('Add Yeast');
      expect(addYeastButton).toBeDefined();
    });

    it('shows calculated stats section', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      expect(screen.getByText('Calculated Stats')).toBeDefined();
      expect(screen.getByText('OG')).toBeDefined();
      expect(screen.getByText('FG')).toBeDefined();
      expect(screen.getByText('ABV')).toBeDefined();
    });

    it('has save button', async () => {
      const user = userEvent.setup();
      renderForm();
      // Save is on step 3 (instructions)
      await navigateToStep(user, 2);
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
      
      // On step 1, click Next Step to go to step 2
      await user.click(screen.getByRole('button', { name: /next step/i }));
      
      // On step 2, click Next Step to go to step 3
      await user.click(screen.getByRole('button', { name: /next step/i }));
      
      // On step 3, click Save Recipe (no name entered)
      await user.click(screen.getByText('Save Recipe'));
      
      // Validation prevents submission - should not navigate
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it('does not call API when validation fails', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 2);
      
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
      await navigateToStep(user, 1);
      
      const addGrainButton = screen.getByText('Add Grain');
      await user.click(addGrainButton);
      
      // GrainInput uses aria-label="Grain Name" for the name input
      expect(screen.getByLabelText('Grain Name')).toBeDefined();
      expect(screen.getByLabelText('Weight')).toBeDefined();
    });

    it('removes a grain row when clicking remove', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      
      const addGrainButton = screen.getByText('Add Grain');
      await user.click(addGrainButton);
      
      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);
      
      // After removing, the empty state message should appear
      expect(screen.getByText('No grains added yet')).toBeDefined();
    });

    it('adds a hop row when clicking add hop', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      
      const addHopButton = screen.getByText('Add Hop');
      await user.click(addHopButton);
      
      // HopInput uses aria-label for its inputs
      expect(screen.getByLabelText('Hop Name')).toBeDefined();
    });

    it('adds a yeast row when clicking add yeast', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      
      const addYeastButton = screen.getByText('Add Yeast');
      await user.click(addYeastButton);
      
      // YeastInput uses aria-label for its inputs
      expect(screen.getByLabelText('Yeast Name')).toBeDefined();
    });

    it('allows multiple grains', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      
      const addGrainButton = screen.getByText('Add Grain');
      await user.click(addGrainButton);
      await user.click(addGrainButton);
      
      // Should have two grain input sections
      const removeButtons = screen.getAllByText('Remove');
      expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Form Submission', () => {
    it('calls createRecipe API on submit for new recipe', async () => {
      const user = userEvent.setup();
      renderForm();
      
      await user.type(screen.getByLabelText(/recipe name/i), 'Test IPA');
      
      // Navigate to step 3 where Save is
      await navigateToStep(user, 2);
      
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
      
      await navigateToStep(user, 2);
      
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
      
      await navigateToStep(user, 2);
      
      const saveButton = screen.getByText('Save Recipe');
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(mockUpdateRecipe).toHaveBeenCalledWith('1', expect.any(Object));
      });
    });
  });

  describe('RecipeStats', () => {
    it('displays default values when no ingredients', async () => {
      const user = userEvent.setup();
      renderForm();
      await navigateToStep(user, 1);
      expect(screen.getByText('OG')).toBeDefined();
      expect(screen.getAllByText('1.000').length).toBeGreaterThan(0);
      expect(screen.getByText('FG')).toBeDefined();
      expect(screen.getByText('ABV')).toBeDefined();
    });
  });
});
