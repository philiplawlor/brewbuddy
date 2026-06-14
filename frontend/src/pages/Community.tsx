import { useState, useEffect } from 'react';
import { recipeAPI } from '../services/api';
import { CommunityRecipeCard } from '../components/CommunityRecipeCard';

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Rated' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export function Community() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchRecipes();
  }, [search, style, sort, page]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12, sort };
      if (search) params.search = search;
      if (style) params.style = style;

      const response = await recipeAPI.getCommunityRecipes(params);
      setRecipes(response.data.recipes);
      setPagination(response.data.pagination);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load community recipes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-primary">
            Community Recipes
          </h1>
          <p className="text-secondary mt-1">
            Discover and rate recipes shared by fellow brewers
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input-theme w-full rounded-lg px-4 py-2"
            />
          </div>
          <select
            value={style}
            onChange={(e) => {
              setStyle(e.target.value);
              setPage(1);
            }}
            className="input-theme rounded-lg px-4 py-2"
          >
            <option value="">All Styles</option>
            <option value="American IPA">American IPA</option>
            <option value="Pale Ale">Pale Ale</option>
            <option value="Stout">Stout</option>
            <option value="Wheat Beer">Wheat Beer</option>
            <option value="Lager">Lager</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-theme rounded-lg px-4 py-2"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-secondary">Loading community recipes...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && recipes.length === 0 && (
          <div className="text-center py-16 bg-card/30 backdrop-blur-sm rounded-xl border border-default">
            <div className="text-6xl mb-4">🍺</div>
            <h3 className="font-display text-xl font-semibold text-primary mb-2">
              No shared recipes yet
            </h3>
            <p className="text-secondary mb-6">
              Be the first to share a recipe with the community!
            </p>
          </div>
        )}

        {/* Recipes Grid */}
        {!loading && recipes.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {recipes.map((recipe) => (
                <CommunityRecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-default text-secondary hover:border-hover hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-secondary">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 rounded-lg border border-default text-secondary hover:border-hover hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
