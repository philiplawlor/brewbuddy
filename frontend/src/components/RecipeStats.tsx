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
      <div className="bg-amber-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase">OG</p>
        <p className="text-lg font-bold text-amber-800">{og.toFixed(3)}</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase">FG</p>
        <p className="text-lg font-bold text-amber-800">{fg.toFixed(3)}</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase">ABV</p>
        <p className="text-lg font-bold text-amber-800">{abv.toFixed(1)}%</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase">IBU</p>
        <p className="text-lg font-bold text-amber-800">{ibu.toFixed(1)}</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase">SRM</p>
        <p className="text-lg font-bold text-amber-800">{srm.toFixed(1)}</p>
      </div>
      <div className="bg-amber-50 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-500 uppercase">Calories</p>
        <p className="text-lg font-bold text-amber-800">{calories}</p>
      </div>
    </div>
  );
}
