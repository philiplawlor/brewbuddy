import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { StarRating } from '../components/StarRating';
import { CommentSection } from '../components/CommentSection';
import { useAuth } from '../context/AuthContext';

export function CommunityRecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [ratings, setRatings] = useState({ averageRating: 0, ratingCount: 0, userRating: null as number | null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) fetchRecipe(id);
  }, [id]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setLoading(true);
      const response = await recipeAPI.getCommunityRecipeById(recipeId);
      setRecipe(response.data.recipe);
      setComments(response.data.comments || []);

      // Fetch ratings
      const ratingsResponse = await recipeAPI.getRecipeRatings(recipeId);
      setRatings(ratingsResponse.data);

      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (rating: number) => {
    if (!id) return;
    try {
      const response = await recipeAPI.rateRecipe(id, { rating });
      setRatings({
        averageRating: response.data.averageRating,
        ratingCount: response.data.ratingCount,
        userRating: rating,
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to rate recipe');
    }
  };

  const handleAddComment = async (text: string) => {
    if (!id) return;
    const response = await recipeAPI.addComment(id, { text });
    setComments([response.data.comment, ...comments]);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;
    await recipeAPI.deleteComment(id, commentId);
    setComments(comments.filter((c) => c._id !== commentId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-secondary">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error || 'Recipe not found'}
          </div>
          <Link
            to="/community"
            className="text-accent-primary hover:text-accent-hover font-medium"
          >
            ← Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          to="/community"
          className="text-secondary hover:text-accent-primary font-medium mb-6 inline-flex items-center gap-1.5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Community
        </Link>

        {/* Recipe Header */}
        <div className="card-theme rounded-xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-primary">
                {recipe.recipeName}
              </h1>
              <p className="text-secondary mt-1">
                by {recipe.userId?.username || 'Unknown Brewer'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <StarRating
                rating={ratings.averageRating}
                onRate={user ? handleRate : undefined}
                interactive={!!user}
                size="lg"
              />
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {ratings.averageRating > 0 ? ratings.averageRating.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-muted">
                  {ratings.ratingCount} {ratings.ratingCount === 1 ? 'rating' : 'ratings'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Info */}
          <div className="card-theme rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Recipe Info</h2>
            <dl className="space-y-3">
              {recipe.style && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Style</dt>
                  <dd className="font-medium text-primary">{recipe.style}</dd>
                </div>
              )}
              {recipe.method && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Method</dt>
                  <dd className="font-medium text-primary capitalize">
                    {recipe.method.replace('_', ' ')}
                  </dd>
                </div>
              )}
              {recipe.batchSize && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Batch Size</dt>
                  <dd className="font-medium text-primary">
                    {recipe.batchSize} {recipe.batchSizeUnit || 'L'}
                  </dd>
                </div>
              )}
              {recipe.boilTimeMinutes && (
                <div className="flex justify-between items-center py-1.5 border-b border-default/30">
                  <dt className="text-secondary text-sm">Boil Time</dt>
                  <dd className="font-medium text-primary">
                    {recipe.boilTimeMinutes} min
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Stats */}
          <div className="card-theme rounded-xl p-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Estimated Stats</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'OG', value: recipe.estimatedOg?.toFixed(3) },
                { label: 'FG', value: recipe.estimatedFg?.toFixed(3) },
                { label: 'ABV', value: recipe.estimatedAbv ? `${recipe.estimatedAbv.toFixed(1)}%` : undefined },
                { label: 'IBU', value: recipe.estimatedIbu?.toFixed(1) },
                { label: 'SRM', value: recipe.estimatedSrm?.toFixed(1) },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-primary/50 rounded-lg border border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider">{label}</p>
                  <p className={`text-lg font-bold ${value ? 'text-primary' : 'text-secondary'}`}>{value || '—'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        {recipe.notes && (
          <div className="card-theme rounded-xl p-6 mb-6">
            <h2 className="font-display text-lg font-semibold text-primary mb-4">Notes</h2>
            <p className="text-primary/80 whitespace-pre-wrap leading-relaxed">{recipe.notes}</p>
          </div>
        )}

        {/* Comments */}
        <div className="card-theme rounded-xl p-6">
          <h2 className="font-display text-lg font-semibold text-primary mb-4">
            Comments ({comments.length})
          </h2>
          <CommentSection
            recipeId={id!}
            comments={comments}
            onAdd={handleAddComment}
            onDelete={handleDeleteComment}
          />
        </div>
      </div>
    </div>
  );
}
