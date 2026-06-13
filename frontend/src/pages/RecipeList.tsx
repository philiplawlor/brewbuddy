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
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-white">{value}</p>
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
      <div className="min-h-screen bg-brewery-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-display">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brewery-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4 font-display">Error</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={fetchRecipes}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brewery-black pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white font-display">Recipes</h1>
              <p className="text-gray-400 mt-1">
                {totalRecipes} recipe{totalRecipes !== 1 ? 's' : ''} total
              </p>
            </div>
            <Link
              to="/recipes/new"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center shadow-lg shadow-amber-600/20"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Recipe
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="style" className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Style
                </label>
                <select
                  id="style"
                  value={filterStyle}
                  onChange={handleStyleFilter}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                >
                  <option value="">All Styles</option>
                  {uniqueStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSort}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
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
                <label htmlFor="method" className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                  Method
                </label>
                <select
                  id="method"
                  value={filterMethod}
                  onChange={handleMethodFilter}
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
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
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center">
              <div className="w-16 h-16 bg-amber-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 font-display">No recipes found</h3>
              <p className="text-gray-400 mb-6">
                {recipes.length === 0
                  ? "You haven't created any recipes yet."
                  : "No recipes match your search criteria."}
              </p>
              {recipes.length === 0 && (
                <Link
                  to="/recipes/new"
                  className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
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
                    className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-amber-600/30 hover:shadow-[0_0_30px_rgba(217,119,6,0.1)] transition-all duration-300"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white line-clamp-1 group-hover:text-amber-400 transition-colors font-display">
                        {recipe.recipeName}
                      </h3>
                      {recipe.style && (
                        <span className="text-[10px] font-medium text-amber-400 bg-amber-600/10 border border-amber-600/20 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                          {recipe.styleCode && `${recipe.styleCode} - `}{recipe.style}
                        </span>
                      )}
                    </div>

                    {/* Method Badge */}
                    {recipe.method && (
                      <p className="text-sm text-gray-400 mb-4">
                        {methodLabels[recipe.method] || recipe.method}
                      </p>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-700/30 rounded-lg">
                      <MiniStat label="OG" value={recipe.estimatedOg?.toFixed(3) || '—'} />
                      <MiniStat label="IBU" value={recipe.estimatedIbu?.toFixed(1) || '—'} />
                      <MiniStat label="ABV" value={recipe.estimatedAbv ? `${recipe.estimatedAbv.toFixed(1)}%` : '—'} />
                    </div>

                    {/* Batch Info */}
                    {recipe.batchSize && (
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        {recipe.batchSize} {recipe.batchSizeUnit || 'L'}
                      </div>
                    )}

                    {/* Arrow indicator */}
                    <div className="flex justify-end mt-4">
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition duration-200"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-gray-400 text-sm">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition duration-200"
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
