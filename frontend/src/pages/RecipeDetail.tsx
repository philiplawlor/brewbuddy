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

type TabKey = 'ingredients' | 'instructions' | 'notes';

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
  const [activeTab, setActiveTab] = useState<TabKey>('ingredients');

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
      <div className="min-h-screen bg-brewery-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-display">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-brewery-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4 font-display">Error</h2>
            <p className="text-gray-400 mb-6">{error || 'Recipe not found'}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => id && fetchRecipe(id)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                Try Again
              </button>
              <Link
                to="/recipes"
                className="border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 font-semibold py-2 px-4 rounded-lg transition duration-200"
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

  const tabs: { key: TabKey; label: string; icon: JSX.Element }[] = [
    {
      key: 'ingredients',
      label: 'Ingredients',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      key: 'instructions',
      label: 'Instructions',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-brewery-black pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            to="/recipes"
            className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recipes
          </Link>

          {/* Hero Section */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 p-8 border-b border-gray-700/50">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-display">
                    {recipe.recipeName}
                  </h1>
                  {recipe.style && (
                    <p className="text-gray-400 text-lg">
                      {recipe.styleCode && <span className="text-amber-400 mr-2">{recipe.styleCode}</span>}
                      {recipe.style}
                    </p>
                  )}
                  {recipe.method && (
                    <span className="inline-block mt-2 text-xs font-medium text-amber-400 bg-amber-600/10 border border-amber-600/20 px-3 py-1 rounded-full">
                      {methodLabels[recipe.method] || recipe.method}
                    </span>
                  )}
                </div>

                {isOwner && (
                  <div className="flex space-x-3">
                    <Link
                      to={`/recipes/${recipe._id}/edit`}
                      className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 backdrop-blur-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="bg-red-600/80 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-5 divide-x divide-gray-700/50">
              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">OG</p>
                <p className="text-xl font-bold text-white">
                  {recipe.estimatedOg?.toFixed(3) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">FG</p>
                <p className="text-xl font-bold text-white">
                  {recipe.estimatedFg?.toFixed(3) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">IBU</p>
                <p className="text-xl font-bold text-white">
                  {recipe.estimatedIbu?.toFixed(1) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">SRM</p>
                <p className="text-xl font-bold text-white">
                  {recipe.estimatedSrm?.toFixed(1) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">ABV</p>
                <p className="text-xl font-bold text-amber-400">
                  {recipe.estimatedAbv ? `${recipe.estimatedAbv.toFixed(1)}%` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Batch Size</p>
              <p className="text-lg font-bold text-white">
                {recipe.batchSize ? `${recipe.batchSize} ${recipe.batchSizeUnit || 'L'}` : '—'}
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Boil Time</p>
              <p className="text-lg font-bold text-white">
                {recipe.boilTimeMinutes ? `${recipe.boilTimeMinutes} min` : '—'}
              </p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Efficiency</p>
              <p className="text-lg font-bold text-white">
                {recipe.efficiency ? `${recipe.efficiency}%` : '—'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700/50">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-600/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'ingredients' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 font-display">Ingredients</h2>
                  {ingredients.length > 0 ? (
                    <IngredientList ingredients={ingredients} />
                  ) : (
                    <p className="text-gray-400 text-center py-8">No ingredients added yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'instructions' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 font-display">Brewing Instructions</h2>
                  <div className="space-y-4">
                    {recipe.method && (
                      <div className="bg-gray-700/30 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-amber-400 mb-2">Brewing Method</h3>
                        <p className="text-gray-300">
                          {methodLabels[recipe.method] || recipe.method}
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-amber-400 mb-2">Batch Parameters</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Batch Size:</span>{' '}
                          <span className="text-gray-300">{recipe.batchSize ? `${recipe.batchSize} ${recipe.batchSizeUnit || 'L'}` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Boil Time:</span>{' '}
                          <span className="text-gray-300">{recipe.boilTimeMinutes ? `${recipe.boilTimeMinutes} minutes` : '—'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Efficiency:</span>{' '}
                          <span className="text-gray-300">{recipe.efficiency ? `${recipe.efficiency}%` : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4 font-display">Brewer Notes</h2>
                  {recipe.notes ? (
                    <div className="bg-gray-700/30 rounded-lg p-6">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{recipe.notes}</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-6 text-sm text-gray-500 flex justify-between">
            <span>Created: {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'Unknown'}</span>
            {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
              <span>Updated: {new Date(recipe.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 font-display">Delete Recipe</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{recipe.recipeName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
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
