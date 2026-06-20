import { Link } from 'react-router-dom';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const methodLabels: Record<string, string> = {
  all_grain: 'All Grain',
  partial_mash: 'Partial Mash',
  extract: 'Extract',
  biab: 'BIAB',
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipes/${recipe._id}`}
      className="block card-theme rounded-lg hover:shadow-lg transition-all duration-200 p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold line-clamp-1" style={{ color: 'var(--accent-primary)' }}>
          {recipe.recipeName}
        </h3>
        {recipe.style && (
          <span className="text-xs font-medium px-2 py-1 rounded-full tag-theme">
            {recipe.styleCode && `${recipe.styleCode} - `}{recipe.style}
          </span>
        )}
      </div>

      {recipe.method && (
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {methodLabels[recipe.method] || recipe.method}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>OG</p>
          <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
            {recipe.estimatedOg?.toFixed(3) || '—'}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>IBU</p>
          <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
            {recipe.estimatedIbu?.toFixed(1) || '—'}
          </p>
        </div>
        <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>ABV</p>
          <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
            {recipe.estimatedAbv ? `${recipe.estimatedAbv.toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {recipe.batchSize && (
        <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {recipe.batchSize} {recipe.batchSizeUnit || 'L'}
        </div>
      )}
    </Link>
  );
}
