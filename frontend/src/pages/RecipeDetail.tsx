import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { Recipe, RecipeIngredient } from '../types';
import { IngredientList } from '../components/IngredientList';
import { useAuth } from '../context/AuthContext';

const methodLabels: Record<string, string> = {
  all_grain: 'All Grain',
  partial_mash: 'Partial Mash',
  extract: 'Extract',
  biab: 'BIAB',
};

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecipe(id);
      fetchIngredients(id);
    }
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await recipeAPI.getRecipeById(recipeId);
      setRecipe(response.data.recipe);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const fetchIngredients = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}/ingredients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIngredients(data.ingredients || []);
      }
    } catch (err) {
      console.error('Failed to load ingredients:', err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await recipeAPI.deleteRecipe(id);
      navigate('/recipes');
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to delete recipe');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-amber-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-amber-700 text-lg">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error || 'Recipe not found'}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => id && fetchRecipe(id)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Try Again
              </button>
              <Link
                to="/recipes"
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Back to Recipes
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && recipe.userId === user.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/recipes"
            className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-6"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recipes
          </Link>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-amber-600 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{recipe.recipeName}</h1>
                  {recipe.style && (
                    <p className="text-amber-100">
                      {recipe.styleCode && `${recipe.styleCode} - `}{recipe.style}
                    </p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/recipes/${recipe._id}/edit`}
                      className="bg-white text-amber-600 hover:bg-amber-50 font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Original Gravity</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {recipe.estimatedOg?.toFixed(3) || '—'}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Final Gravity</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {recipe.estimatedFg?.toFixed(3) || '—'}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">IBU</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {recipe.estimatedIbu?.toFixed(1) || '—'}
                  </p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">SRM</p>
                  <p className="text-2xl font-bold text-amber-800">
                    {recipe.estimatedSrm?.toFixed(1) || '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ABV</p>
                  <p className="text-xl font-bold text-gray-800">
                    {recipe.estimatedAbv ? `${recipe.estimatedAbv.toFixed(1)}%` : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Batch Size</p>
                  <p className="text-xl font-bold text-gray-800">
                    {recipe.batchSize ? `${recipe.batchSize} ${recipe.batchSizeUnit || 'L'}` : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Boil Time</p>
                  <p className="text-xl font-bold text-gray-800">
                    {recipe.boilTimeMinutes ? `${recipe.boilTimeMinutes} min` : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Efficiency</p>
                  <p className="text-xl font-bold text-gray-800">
                    {recipe.efficiency ? `${recipe.efficiency}%` : '—'}
                  </p>
                </div>
              </div>

              {recipe.method && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-amber-800 mb-3 pb-2 border-b border-amber-100">
                    Brewing Method
                  </h2>
                  <p className="text-gray-700">
                    {methodLabels[recipe.method] || recipe.method}
                  </p>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-amber-800 mb-3 pb-2 border-b border-amber-100">
                  Ingredients
                </h2>
                <IngredientList ingredients={ingredients} />
              </div>

              {recipe.notes && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-amber-800 mb-3 pb-2 border-b border-amber-100">
                    Notes
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{recipe.notes}</p>
                </div>
              )}

              <div className="text-sm text-gray-500 mt-8 pt-4 border-t border-gray-100">
                <p>Created: {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'Unknown'}</p>
                {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
                  <p>Updated: {new Date(recipe.updatedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Recipe</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{recipe.recipeName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}