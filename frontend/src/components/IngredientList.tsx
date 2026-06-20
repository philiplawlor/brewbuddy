import { RecipeIngredient } from '../types';

interface IngredientListProps {
  ingredients: RecipeIngredient[];
}

interface IngredientGroup {
  type: string;
  label: string;
  items: RecipeIngredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
  const groupedIngredients = ingredients.reduce<IngredientGroup[]>((groups, ingredient) => {
    const existingGroup = groups.find(g => g.type === ingredient.ingredientType);
    
    if (existingGroup) {
      existingGroup.items.push(ingredient);
    } else {
      const labels: Record<string, string> = {
        grain: 'Grains & Fermentables',
        hops: 'Hops',
        yeast: 'Yeast',
        adjunct: 'Adjuncts',
        chemical: 'Chemicals & Additives',
      };
      
      groups.push({
        type: ingredient.ingredientType,
        label: labels[ingredient.ingredientType] || ingredient.ingredientType,
        items: [ingredient],
      });
    }
    
    return groups;
  }, []).sort((a, b) => {
    const order = ['grain', 'hops', 'yeast', 'adjunct', 'chemical'];
    return order.indexOf(a.type) - order.indexOf(b.type);
  });

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
        No ingredients added yet
      </div>
    );
  }

  const renderGrain = (ingredient: RecipeIngredient) => (
    <div className="flex justify-between items-center py-2">
      <div>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{ingredient.name}</span>
        {ingredient.category && (
          <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>({ingredient.category})</span>
        )}
      </div>
      <div className="text-right">
        <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
          {ingredient.grainWeight} {ingredient.grainWeightUnit || 'lb'}
        </span>
        {ingredient.lovibond && (
          <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{ingredient.lovibond}°L</span>
        )}
      </div>
    </div>
  );

  const renderHops = (ingredient: RecipeIngredient) => (
    <div className="flex justify-between items-center py-2">
      <div>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{ingredient.name}</span>
        {ingredient.hopForm && (
          <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>({ingredient.hopForm})</span>
        )}
      </div>
      <div className="text-right">
        <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
          {ingredient.hopsWeight} {ingredient.hopsWeightUnit || 'g'}
        </span>
        {ingredient.hopBoilMinutes && (
          <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            @ {ingredient.hopBoilMinutes} min
          </span>
        )}
        {ingredient.hopAlphaAcid && (
          <span className="ml-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            ({ingredient.hopAlphaAcid}% AA)
          </span>
        )}
      </div>
    </div>
  );

  const renderYeast = (ingredient: RecipeIngredient) => (
    <div className="py-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{ingredient.name}</span>
          {ingredient.strainId && (
            <span className="ml-2 text-sm" style={{ color: 'var(--text-muted)' }}>({ingredient.strainId})</span>
          )}
        </div>
        {ingredient.laboratory && (
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{ingredient.laboratory}</span>
        )}
      </div>
      <div className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {ingredient.yeastPackageCount && (
          <span>{ingredient.yeastPackageCount} packet{ingredient.yeastPackageCount > 1 ? 's' : ''}</span>
        )}
        {ingredient.yeastCellCount && (
          <span className="ml-2">({(ingredient.yeastCellCount / 1e9).toFixed(1)}B cells)</span>
        )}
        {ingredient.yeastType && (
          <span className="ml-2 capitalize">• {ingredient.yeastType}</span>
        )}
      </div>
    </div>
  );

  const renderIngredient = (ingredient: RecipeIngredient) => {
    switch (ingredient.ingredientType) {
      case 'grain':
        return renderGrain(ingredient);
      case 'hops':
        return renderHops(ingredient);
      case 'yeast':
        return renderYeast(ingredient);
      default:
        return (
          <div className="flex justify-between items-center py-2">
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{ingredient.name}</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{ingredient.category}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {groupedIngredients.map(group => (
        <div key={group.type}>
          <h4 className="text-lg font-semibold mb-3 pb-2 border-b" style={{ color: 'var(--accent-primary)', borderColor: 'var(--border-default)' }}>
            {group.label}
          </h4>
          <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
            {group.items.map(ingredient => (
              <div key={ingredient._id}>
                {renderIngredient(ingredient)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
