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

  const handleShareToggle = async () => {
    if (!id || !recipe) return;

    const newIsPublic = !recipe.isPublic;
    const action = newIsPublic ? 'share' : 'unshare';

    if (!window.confirm(newIsPublic ? 'Share this recipe with the community?' : 'Unshare this recipe?')) {
      return;
    }

    try {
      await recipeAPI.updateRecipe(id, { isPublic: newIsPublic });
      setRecipe({ ...recipe, isPublic: newIsPublic });
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || `Failed to ${action} recipe`);
    }
  };

  const handleExport = async () => {
    if (!id || !recipe) return;
    try {
      const response = await recipeAPI.exportRecipe(id);
      const blob = new Blob([response.data], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipe.recipeName.replace(/[^a-zA-Z0-9]/g, '_')}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to export recipe');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-current rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <p className="text-lg font-display" style={{ color: 'var(--text-secondary)' }}>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="card-theme rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4 font-display">Error</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error || 'Recipe not found'}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => id && fetchRecipe(id)}
                className="text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                Try Again
              </button>
              <Link
                to="/recipes"
                className="card-theme font-semibold py-2 px-4 rounded-lg transition duration-200"
                style={{ color: 'var(--text-secondary)' }}
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
    <div className="min-h-screen pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            to="/recipes"
            className="inline-flex items-center mb-6 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recipes
          </Link>

          {/* Hero Section */}
          <div className="card-theme rounded-2xl overflow-hidden mb-6">
            <div className="p-8 border-b" style={{ background: 'linear-gradient(135deg, var(--tag-bg), transparent)', borderColor: 'var(--border-default)' }}>
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 font-display" style={{ color: 'var(--text-primary)' }}>
                    {recipe.recipeName}
                  </h1>
                  {recipe.style && (
                    <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                      {recipe.styleCode && <span className="mr-2" style={{ color: 'var(--accent-primary)' }}>{recipe.styleCode}</span>}
                      {recipe.style}
                    </p>
                  )}
                  {recipe.method && (
                    <span className="inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full tag-theme">
                      {methodLabels[recipe.method] || recipe.method}
                    </span>
                  )}
                </div>

                {isOwner && (
                  <div className="flex space-x-3">
                    <Link
                      to={`/recipes/${recipe._id}/edit`}
                      className="card-theme font-semibold py-2 px-4 rounded-lg transition duration-200"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={handleShareToggle}
                      className={`font-semibold py-2 px-4 rounded-lg transition duration-200 ${
                        recipe.isPublic
                          ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                          : 'card-theme'
                      }`}
                      style={!recipe.isPublic ? { color: 'var(--text-primary)' } : undefined}
                    >
                      {recipe.isPublic ? '🌍 Shared' : '🔗 Share'}
                    </button>
                    <button
                      onClick={handleExport}
                      className="card-theme font-semibold py-2 px-4 rounded-lg transition duration-200"
                      style={{ color: 'var(--text-primary)' }}
                      title="Export as BeerXML"
                    >
                      📥 Export
                    </button>
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
            <div className="grid grid-cols-5 divide-x" style={{ borderColor: 'var(--border-default)' }}>
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>OG</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {recipe.estimatedOg?.toFixed(3) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>FG</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {recipe.estimatedFg?.toFixed(3) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>IBU</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {recipe.estimatedIbu?.toFixed(1) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>SRM</p>
                <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {recipe.estimatedSrm?.toFixed(1) || '—'}
                </p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>ABV</p>
                <p className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                  {recipe.estimatedAbv ? `${recipe.estimatedAbv.toFixed(1)}%` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="card-theme rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Batch Size</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {recipe.batchSize ? `${recipe.batchSize} ${recipe.batchSizeUnit || 'L'}` : '—'}
              </p>
            </div>
            <div className="card-theme rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Boil Time</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {recipe.boilTimeMinutes ? `${recipe.boilTimeMinutes} min` : '—'}
              </p>
            </div>
            <div className="card-theme rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Efficiency</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {recipe.efficiency ? `${recipe.efficiency}%` : '—'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="card-theme rounded-2xl overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b" style={{ borderColor: 'var(--border-default)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all duration-200"
                  style={{
                    color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    borderBottom: activeTab === tab.key ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    backgroundColor: activeTab === tab.key ? 'var(--tag-bg)' : 'transparent',
                  }}
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
                  <h2 className="text-xl font-semibold mb-4 font-display" style={{ color: 'var(--text-primary)' }}>Ingredients</h2>
                  {ingredients.length > 0 ? (
                    <IngredientList ingredients={ingredients} />
                  ) : (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No ingredients added yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'instructions' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 font-display" style={{ color: 'var(--text-primary)' }}>Brewing Instructions</h2>
                  <div className="space-y-4">
                    {recipe.method && (
                      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Brewing Method</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          {methodLabels[recipe.method] || recipe.method}
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Batch Parameters</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Batch Size:</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>{recipe.batchSize ? `${recipe.batchSize} ${recipe.batchSizeUnit || 'L'}` : '—'}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Boil Time:</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>{recipe.boilTimeMinutes ? `${recipe.boilTimeMinutes} minutes` : '—'}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Efficiency:</span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>{recipe.efficiency ? `${recipe.efficiency}%` : '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 font-display" style={{ color: 'var(--text-primary)' }}>Brewer Notes</h2>
                  {recipe.notes ? (
                    <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <p className="whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{recipe.notes}</p>
                    </div>
                  ) : (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No notes added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-6 text-sm flex justify-between" style={{ color: 'var(--text-muted)' }}>
            <span>Created: {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'Unknown'}</span>
            {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
              <span>Updated: {new Date(recipe.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'var(--overlay-bg)' }}>
          <div className="card-theme rounded-2xl max-w-md w-full mx-4 p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 font-display" style={{ color: 'var(--text-primary)' }}>Delete Recipe</h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete "{recipe.recipeName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="card-theme font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                style={{ color: 'var(--text-secondary)' }}
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
