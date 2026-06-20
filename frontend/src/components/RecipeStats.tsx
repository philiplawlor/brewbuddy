interface RecipeStatsProps {
  og: number;
  fg: number;
  abv: number;
  ibu: number;
  srm: number;
  calories: number;
}

export function RecipeStats({ og, fg, abv, ibu, srm, calories }: RecipeStatsProps) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>OG</p>
        <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>{og.toFixed(3)}</p>
      </div>
      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>FG</p>
        <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>{fg.toFixed(3)}</p>
      </div>
      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>ABV</p>
        <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>{abv.toFixed(1)}%</p>
      </div>
      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>IBU</p>
        <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>{ibu.toFixed(1)}</p>
      </div>
      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>SRM</p>
        <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>{srm.toFixed(1)}</p>
      </div>
      <div className="rounded-lg p-3 text-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <p className="text-xs uppercase" style={{ color: 'var(--text-muted)' }}>Calories</p>
        <p className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>{calories}</p>
      </div>
    </div>
  );
}
