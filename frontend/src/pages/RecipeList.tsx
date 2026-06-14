import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { Recipe, RecipeListResponse } from '../types';

const methodLabels: Record<string, string> = {
  all_grain: 'All Grain',
  partial_mash: 'Partial Mash',
  extract: 'Extract',
  biab: 'BIAB',
};

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  );
}

export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStyle, setFilterStyle] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');

  useEffect(() => {
    fetchRecipes();
  }, [page, sortBy]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await recipeAPI.getRecipes({
        page,
        limit: 12,
        sort: sortBy,
      });
      const data: RecipeListResponse = response.data;
      setRecipes(data.recipes);
      setTotalPages(data.pagination.pages);
      setTotalRecipes(data.pagination.total);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = searchQuery === '' ||
        recipe.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (recipe.style?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (recipe.styleCode?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStyle = filterStyle === '' || recipe.style === filterStyle;
      const matchesMethod = filterMethod === '' || recipe.method === filterMethod;

      return matchesSearch && matchesStyle && matchesMethod;
    });
  }, [recipes, searchQuery, filterStyle, filterMethod]);

  const uniqueStyles = useMemo(() => {
    const styles = new Set(recipes.map(r => r.style).filter(Boolean));
    return Array.from(styles).sort();
  }, [recipes]);

  const uniqueMethods = useMemo(() => {
    const methods = recipes.map(r => r.method).filter((m): m is NonNullable<typeof m> => Boolean(m));
    return Array.from(new Set(methods)).sort();
  }, [recipes]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStyleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStyle(e.target.value);
    setPage(1);
  };

  const handleMethodFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterMethod(e.target.value);
    setPage(1);
  };

  const handleSort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-current rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <p className="text-lg font-display" style={{ color: 'var(--text-secondary)' }}>Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="card-theme rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4 font-display">Error</h2>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button
              onClick={fetchRecipes}
              className="text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              style={{ backgroundColor: 'var(--accent-primary)' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>Recipes</h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
                {totalRecipes} recipe{totalRecipes !== 1 ? 's' : ''} total
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/recipes/import"
                className="card-theme font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center"
                style={{ color: 'var(--text-primary)' }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import
              </Link>
              <Link
                to="/recipes/new"
                className="text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Recipe
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="card-theme rounded-xl p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full input-theme rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label htmlFor="style" className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Style
                </label>
                <select
                  id="style"
                  value={filterStyle}
                  onChange={handleStyleFilter}
                  className="w-full input-theme rounded-lg px-4 py-2"
                >
                  <option value="">All Styles</option>
                  {uniqueStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSort}
                  className="w-full input-theme rounded-lg px-4 py-2"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="recipeName">Name (A-Z)</option>
                  <option value="-recipeName">Name (Z-A)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label htmlFor="method" className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Method
                </label>
                <select
                  id="method"
                  value={filterMethod}
                  onChange={handleMethodFilter}
                  className="w-full input-theme rounded-lg px-4 py-2"
                >
                  <option value="">All Methods</option>
                  {uniqueMethods.map(method => (
                    <option key={method} value={method}>{methodLabels[method] || method}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Recipe Grid or Empty State */}
          {filteredRecipes.length === 0 ? (
            <div className="card-theme rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--tag-bg)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--accent-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-display" style={{ color: 'var(--text-primary)' }}>No recipes found</h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {recipes.length === 0
                  ? "You haven't created any recipes yet."
                  : "No recipes match your search criteria."}
              </p>
              {recipes.length === 0 && (
                <Link
                  to="/recipes/new"
                  className="inline-block text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
                  style={{ backgroundColor: 'var(--accent-primary)' }}
                >
                  Create Your First Recipe
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <Link
                    key={recipe._id}
                    to={`/recipes/${recipe._id}`}
                    className="group card-theme rounded-xl p-6 transition-all duration-300"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold line-clamp-1 transition-colors font-display" style={{ color: 'var(--text-primary)' }}>
                        {recipe.recipeName}
                      </h3>
                      {recipe.style && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2 tag-theme">
                          {recipe.styleCode && `${recipe.styleCode} - `}{recipe.style}
                        </span>
                      )}
                    </div>

                    {/* Method Badge */}
                    {recipe.method && (
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {methodLabels[recipe.method] || recipe.method}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <MiniStat label="OG" value={recipe.estimatedOg?.toFixed(3) || '—'} />
                      <MiniStat label="IBU" value={recipe.estimatedIbu?.toFixed(1) || '—'} />
                      <MiniStat label="ABV" value={recipe.estimatedAbv ? `${recipe.estimatedAbv.toFixed(1)}%` : '—'} />
                    </div>

                    {/* Batch Info */}
                    {recipe.batchSize && (
                      <div className="flex items-center text-sm" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {recipe.batchSize} {recipe.batchSizeUnit || 'L'}
                      </div>
                    )}

                    {/* Arrow indicator */}
                    <div className="flex justify-end mt-4">
                      <svg className="w-5 h-5 transition-all" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 card-theme rounded-lg transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 card-theme rounded-lg transition duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
