import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ImportRecipe } from '../src/pages/ImportRecipe';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockImportRecipe = vi.fn();
const mockImportRecipeConfirm = vi.fn();
vi.mock('../src/services/api', () => ({
  recipeAPI: {
    importRecipe: (...args: unknown[]) => mockImportRecipe(...args),
    importRecipeConfirm: (...args: unknown[]) => mockImportRecipeConfirm(...args),
  },
}));

vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'test@example.com', name: 'Test User' },
    loading: false,
  }),
}));

const renderImportPage = () => {
  return render(
    <MemoryRouter>
      <ImportRecipe />
    </MemoryRouter>
  );
};

// jsdom doesn't support File.text(), need to mock it
function createMockFile(content: string, name: string, type: string): File {
  const file = new File([content], name, { type });
  file.text = vi.fn().mockResolvedValue(content);
  return file;
}

describe('ImportRecipe Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the import page with heading', () => {
    renderImportPage();

    expect(screen.getByText('Import BeerXML Recipe')).toBeTruthy();
    expect(screen.getByText('Drag & drop a BeerXML file')).toBeTruthy();
  });

  it('should show hidden file input accepting xml/beerxml', () => {
    renderImportPage();

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.accept).toContain('xml');
    expect(hiddenInput.accept).toContain('beerxml');
  });

  it('should accept .xml and .beerxml files', () => {
    renderImportPage();

    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect((hiddenInput as HTMLInputElement).accept).toContain('xml');
  });

  it('should parse and preview a valid XML file', async () => {
    mockImportRecipe.mockResolvedValue({
      data: {
        recipe: { recipeName: 'Imported IPA', method: 'all_grain', batchSize: 20 },
        hops: [{ name: 'Citra', alpha: 12, use: 'Boil' }],
        fermentables: [{ name: 'Pale Malt', amount: 4.5 }],
        yeasts: [{ name: 'US-05' }],
      },
    });

    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('<RECIPES><RECIPE><NAME>Imported IPA</NAME></RECIPE></RECIPES>', 'test.xml', 'application/xml');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockImportRecipe).toHaveBeenCalled();
    });
  });

  it('should show error for invalid file type', async () => {
    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('test', 'test.txt', 'text/plain');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Please select a \.xml or \.beerxml file/)).toBeTruthy();
    });
  });

  it('should handle parse errors gracefully', async () => {
    mockImportRecipe.mockRejectedValue({
      response: { data: { error: 'Failed to parse XML' } },
    });

    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('invalid xml', 'test.xml', 'application/xml');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Failed to parse XML')).toBeTruthy();
    });
  });

  it('should show recipe preview after successful parse', async () => {
    mockImportRecipe.mockResolvedValue({
      data: {
        recipe: { recipeName: 'Imported IPA', method: 'all_grain', batchSize: 20 },
        hops: [{ name: 'Citra' }],
        fermentables: [{ name: 'Pale Malt' }],
        yeasts: [{ name: 'US-05' }],
      },
    });

    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('<RECIPES><RECIPE><NAME>Imported IPA</NAME></RECIPE></RECIPES>', 'test.xml', 'application/xml');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Recipe Preview')).toBeTruthy();
      expect(screen.getByText('Imported IPA')).toBeTruthy();
    });
  });

  it('should confirm import and navigate to recipes', async () => {
    mockImportRecipe.mockResolvedValue({
      data: {
        recipe: { recipeName: 'Imported IPA', method: 'all_grain' },
        hops: [],
        fermentables: [],
        yeasts: [],
      },
    });
    mockImportRecipeConfirm.mockResolvedValue({
      data: { recipe: { _id: 'new-recipe-id' } },
    });

    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('<RECIPES><RECIPE><NAME>Imported IPA</NAME></RECIPE></RECIPES>', 'test.xml', 'application/xml');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Recipe Preview')).toBeTruthy();
    });

    const confirmButton = screen.getByRole('button', { name: 'Import Recipe' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockImportRecipeConfirm).toHaveBeenCalled();
    });
  });

  it('should allow canceling import preview', async () => {
    mockImportRecipe.mockResolvedValue({
      data: {
        recipe: { recipeName: 'Imported IPA', method: 'all_grain' },
        hops: [],
        fermentables: [],
        yeasts: [],
      },
    });

    renderImportPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('<RECIPES><RECIPE><NAME>Imported IPA</NAME></RECIPE></RECIPES>', 'test.xml', 'application/xml');

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Recipe Preview')).toBeTruthy();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Drag & drop a BeerXML file')).toBeTruthy();
    });
  });

  it('should have a link back to recipes', () => {
    renderImportPage();

    const backLink = screen.getByText('Back to Recipes');
    expect(backLink).toBeTruthy();
    expect((backLink as HTMLAnchorElement).getAttribute('href')).toBe('/recipes');
  });
});
