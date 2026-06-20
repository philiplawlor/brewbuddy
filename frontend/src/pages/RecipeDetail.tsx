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

type TabKey = 'ingredients' | 'brewday' | 'style' | 'notes';

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
      const response = await recipeAPI.getRecipeIngredients(recipeId);
      setIngredients(response.data.ingredients || []);
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
      key: 'brewday',
      label: 'Brew Day',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      key: 'style',
      label: 'Style',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

  // Helper to render style section
  const renderStyleSection = (label: string, content?: string) => {
    if (!content) return null;
    return (
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--accent-primary)' }}>{label}</h4>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{content}</p>
      </div>
    );
  };

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
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {recipe.method && (
                      <span className="text-xs font-medium px-3 py-1 rounded-full tag-theme">
                        {methodLabels[recipe.method] || recipe.method}
                      </span>
                    )}
                    {recipe.brewer && (
                      <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                        Brewed by {recipe.brewer}
                      </span>
                    )}
                    {recipe.brewDate && (
                      <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                        {new Date(recipe.brewDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <div className="flex space-x-3">
                    <Link
                      to={`/brew-sessions/new?recipeId=${recipe._id}`}
                      className="font-semibold py-2 px-4 rounded-lg transition duration-200"
                      style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--brewery-black)' }}
                    >
                      🍺 Start Brewing
                    </Link>
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
              {/* INGREDIENTS TAB */}
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

              {/* BREW DAY TAB */}
              {activeTab === 'brewday' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 font-display" style={{ color: 'var(--text-primary)' }}>Brew Day</h2>

                  {/* Mash Profile */}
                  {recipe.mashProfile && recipe.mashProfile.steps && recipe.mashProfile.steps.length > 0 && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>
                        {recipe.mashProfile.name || 'Mash Profile'}
                      </h3>
                      {recipe.mashProfile.grainTemp && (
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Grain Temp: {recipe.mashProfile.grainTemp}°C</p>
                      )}
                      <div className="space-y-2">
                        {recipe.mashProfile.steps.map((step, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--brewery-black)' }}>
                              {i + 1}
                            </span>
                            <div className="flex-1">
                              <span style={{ color: 'var(--text-primary)' }}>{step.name}</span>
                              <span className="ml-2 text-xs capitalize" style={{ color: 'var(--text-muted)' }}>({step.type})</span>
                            </div>
                            <div className="text-right text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {step.stepTemp && <span>{step.stepTemp}°C</span>}
                              {step.stepTime && <span className="ml-2">({step.stepTime} min)</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment */}
                  {recipe.equipment && recipe.equipment.name && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Equipment</h3>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{recipe.equipment.name}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {recipe.equipment.tunVolume && <span>Mash Tun: {recipe.equipment.tunVolume} L</span>}
                        {recipe.equipment.boilKettleVolume && <span>Boil Kettle: {recipe.equipment.boilKettleVolume} L</span>}
                        {recipe.equipment.evapRate && <span>Evap Rate: {recipe.equipment.evapRate} L/hr</span>}
                        {recipe.equipment.lauterDeadSpace && <span>Dead Space: {recipe.equipment.lauterDeadSpace} L</span>}
                        {recipe.equipment.topUpWater && <span>Top Up Water: {recipe.equipment.topUpWater} L</span>}
                        {recipe.equipment.trubChillerLoss && <span>Trub/Chiller Loss: {recipe.equipment.trubChillerLoss} L</span>}
                        {recipe.equipment.whirlpoolTime && <span>Whirlpool: {recipe.equipment.whirlpoolTime} min</span>}
                        {recipe.equipment.whirlpoolTemp && <span>Whirlpool Temp: {recipe.equipment.whirlpoolTemp}°C</span>}
                      </div>
                    </div>
                  )}

                  {/* Fermentation */}
                  {(recipe.primaryAgeDays || recipe.primaryTemp || recipe.secondaryAgeDays || recipe.secondaryTemp || recipe.carbonation) && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>Fermentation</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {recipe.primaryAgeDays && <span>Primary: {recipe.primaryAgeDays} days</span>}
                        {recipe.primaryTemp && <span>Primary Temp: {recipe.primaryTemp}°C</span>}
                        {recipe.secondaryAgeDays && <span>Secondary: {recipe.secondaryAgeDays} days</span>}
                        {recipe.secondaryTemp && <span>Secondary Temp: {recipe.secondaryTemp}°C</span>}
                        {recipe.tertiaryAgeDays && <span>Tertiary: {recipe.tertiaryAgeDays} days</span>}
                        {recipe.tertiaryTemp && <span>Tertiary Temp: {recipe.tertiaryTemp}°C</span>}
                        {recipe.carbonation && <span>Carbonation: {recipe.carbonation} volumes</span>}
                        {recipe.carbonationTemp && <span>Carbonation Temp: {recipe.carbonationTemp}°C</span>}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  {recipe.instructions && recipe.instructions.length > 0 && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>Instructions ({recipe.instructions.length} steps)</h3>
                      <ol className="space-y-2 list-decimal list-inside text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {recipe.instructions.map((inst, i) => (
                          <li key={i}>
                            <span style={{ color: 'var(--text-primary)' }}>{inst.name || `Step ${i + 1}`}</span>
                            {inst.time && <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({inst.time} min)</span>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Misc Ingredients */}
                  {recipe.miscIngredients && recipe.miscIngredients.length > 0 && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--accent-primary)' }}>Other Ingredients</h3>
                      <ul className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {recipe.miscIngredients.map((m, i) => (
                          <li key={i}>
                            <span style={{ color: 'var(--text-primary)' }}>{m.name}</span>
                            {m.amount && <span> — {m.amount}{m.amountIsWeight ? 'g' : 'mL'}</span>}
                            {m.use && <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>({m.use})</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!recipe.mashProfile && !recipe.equipment && !recipe.instructions && !recipe.miscIngredients && !(recipe.primaryAgeDays || recipe.primaryTemp) && (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No brew day data available.</p>
                  )}
                </div>
              )}

              {/* STYLE TAB */}
              {activeTab === 'style' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 font-display" style={{ color: 'var(--text-primary)' }}>Style Information</h2>

                  {recipe.styleProfile ? (
                    <div className="space-y-4">
                      {/* Style Header */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                          {recipe.styleProfile.name || recipe.style}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {recipe.styleProfile.category && <span>Category: {recipe.styleProfile.category}</span>}
                          {recipe.styleProfile.styleLetter && <span>• {recipe.styleProfile.styleLetter}</span>}
                          {recipe.styleProfile.styleGuide && <span>• {recipe.styleProfile.styleGuide}</span>}
                        </div>
                      </div>

                      {/* Style Ranges */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>BJCP Ranges</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {recipe.styleProfile.ogMin && recipe.styleProfile.ogMax && (
                            <span>OG: {recipe.styleProfile.ogMin.toFixed(3)} – {recipe.styleProfile.ogMax.toFixed(3)}</span>
                          )}
                          {recipe.styleProfile.fgMin && recipe.styleProfile.fgMax && (
                            <span>FG: {recipe.styleProfile.fgMin.toFixed(3)} – {recipe.styleProfile.fgMax.toFixed(3)}</span>
                          )}
                          {recipe.styleProfile.ibuMin && recipe.styleProfile.ibuMax && (
                            <span>IBU: {recipe.styleProfile.ibuMin} – {recipe.styleProfile.ibuMax}</span>
                          )}
                          {recipe.styleProfile.colorMin && recipe.styleProfile.colorMax && (
                            <span>SRM: {recipe.styleProfile.colorMin} – {recipe.styleProfile.colorMax}</span>
                          )}
                          {recipe.styleProfile.abvMin && recipe.styleProfile.abvMax && (
                            <span>ABV: {recipe.styleProfile.abvMin}% – {recipe.styleProfile.abvMax}%</span>
                          )}
                        </div>
                      </div>

                      {/* Style Description Sections */}
                      {renderStyleSection('Aroma', recipe.styleProfile.aroma)}
                      {renderStyleSection('Appearance', recipe.styleProfile.appearance)}
                      {renderStyleSection('Flavor', recipe.styleProfile.flavor)}
                      {renderStyleSection('Mouthfeel', recipe.styleProfile.mouthfeel)}
                      {renderStyleSection('Overall Impression', recipe.styleProfile.overallImpression)}
                      {renderStyleSection('Profile', recipe.styleProfile.profile)}
                      {renderStyleSection('Ingredients', recipe.styleProfile.ingredients)}
                      {renderStyleSection('Commercial Examples', recipe.styleProfile.examples)}
                      {renderStyleSection('Notes', recipe.styleProfile.notes)}
                    </div>
                  ) : (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No style profile data available.</p>
                  )}
                </div>
              )}

              {/* NOTES TAB */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4 font-display" style={{ color: 'var(--text-primary)' }}>Notes</h2>

                  {/* Brewer Info */}
                  {(recipe.brewer || recipe.asstBrewer || recipe.brewDate) && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Brewer</h3>
                      <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        {recipe.brewer && <p>Head Brewer: {recipe.brewer}</p>}
                        {recipe.asstBrewer && <p>Assistant Brewer: {recipe.asstBrewer}</p>}
                        {recipe.brewDate && <p>Brew Date: {new Date(recipe.brewDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  )}

                  {/* Recipe Notes */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Recipe Notes</h3>
                    {recipe.notes ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>{recipe.notes}</p>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No recipe notes.</p>
                    )}
                  </div>

                  {/* Taste Notes */}
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Taste Notes</h3>
                    {recipe.tasteNotes ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-sm" style={{ color: 'var(--text-secondary)' }}>{recipe.tasteNotes}</p>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No taste notes.</p>
                    )}
                    {recipe.tasteRating && (
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Taste Rating: {recipe.tasteRating}/50</p>
                    )}
                  </div>

                  {/* Carbonation */}
                  {(recipe.carbonation || recipe.primingSugarName) && (
                    <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--accent-primary)' }}>Carbonation</h3>
                      <div className="text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        {recipe.carbonation && <p>Target: {recipe.carbonation} volumes CO₂</p>}
                        {recipe.primingSugarName && <p>Priming Sugar: {recipe.primingSugarName}</p>}
                        {recipe.forcedCarbonation && <p>Method: Force Carbonated</p>}
                      </div>
                    </div>
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
