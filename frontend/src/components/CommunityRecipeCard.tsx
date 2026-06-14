import { Link } from 'react-router-dom';
import { StarRating } from './StarRating';

interface CommunityRecipeCardProps {
  recipe: {
    _id: string;
    recipeName: string;
    style?: string;
    method?: string;
    averageRating?: number;
    ratingCount?: number;
    userId: {
      _id: string;
      username: string;
    };
  };
}

export function CommunityRecipeCard({ recipe }: CommunityRecipeCardProps) {
  return (
    <Link
      to={`/community/recipe/${recipe._id}`}
      className="group block card-theme rounded-xl p-5 hover:border-accent-primary/30 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold text-primary truncate group-hover:text-accent-primary transition-colors">
            {recipe.recipeName}
          </h3>
          <p className="text-sm text-secondary mt-0.5">
            by {recipe.userId?.username || 'Unknown Brewer'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {recipe.style && (
          <span className="text-xs tag-theme px-2 py-0.5 rounded">
            {recipe.style}
          </span>
        )}
        {recipe.method && (
          <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded capitalize">
            {recipe.method.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <StarRating rating={recipe.averageRating || 0} size="sm" />
        <span className="text-sm text-secondary">
          {recipe.averageRating ? recipe.averageRating.toFixed(1) : '—'}
        </span>
        <span className="text-xs text-muted">
          ({recipe.ratingCount || 0} {recipe.ratingCount === 1 ? 'rating' : 'ratings'})
        </span>
      </div>
    </Link>
  );
}
