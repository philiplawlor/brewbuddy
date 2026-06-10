import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { Recipe, RecipeListResponse } from '../types';
import { RecipeCard } from '../components/RecipeCard';
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

  const methodLabels: Record<string, string> = {
    all_grain: 'All Grain',
    partial_mash: 'Partial Mash',
    extract: 'Extract',
    biab: 'BIAB',
  };

  if (loading && recipes.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-amber-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-amber-700 text-lg">Loading recipes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchRecipes}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-800">My Recipes</h1>
              <p className="text-amber-700 mt-1">
                {totalRecipes} recipe{totalRecipes !== 1 ? 's' : ''} total
              </p>
            </div>
            <Link
              to="/recipes/new"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Recipe
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                />
              </div>
              
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
                  Style
                </label>
                <select
                  id="style"
                  value={filterStyle}
                  onChange={handleStyleFilter}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                >
                  <option value="">All Styles</option>
                  {uniqueStyles.map(style => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={handleSort}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
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
                <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <select
                  id="method"
                  value={filterMethod}
                  onChange={handleMethodFilter}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                >
                  <option value="">All Methods</option>
                  {uniqueMethods.map(method => (
                    <option key={method} value={method}>{methodLabels[method] || method}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-16 h-16 text-amber-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes found</h3>
              <p className="text-gray-500 mb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2 text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
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