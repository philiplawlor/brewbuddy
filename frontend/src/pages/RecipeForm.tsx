import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipeAPI } from '../services/api';
import { GrainInput, GrainData } from '../components/GrainInput';
import { HopInput, HopData } from '../components/HopInput';
import { YeastInput, YeastData } from '../components/YeastInput';
import { RecipeStats } from '../components/RecipeStats';

interface FormData {
  recipeName: string;
  style: string;
  styleCode: string;
  method: 'all_grain' | 'partial_mash' | 'extract' | 'biab';
  batchSize: number;
  boilTimeMinutes: number;
  efficiency: number;
  notes: string;
}

interface FormErrors {
  recipeName?: string;
}

const defaultFormData: FormData = {
  recipeName: '',
  style: '',
  styleCode: '',
  method: 'all_grain',
  batchSize: 20,
  boilTimeMinutes: 60,
  efficiency: 75,
  notes: '',
};

export function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [grains, setGrains] = useState<GrainData[]>([]);
  const [hops, setHops] = useState<HopData[]>([]);
  const [yeasts, setYeasts] = useState<YeastData[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      fetchRecipe(id);
    }
  }, [id, isEditMode]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      setFetchLoading(true);
      const response = await recipeAPI.getRecipeById(recipeId);
      const recipe = response.data.recipe;
      setFormData({
        recipeName: recipe.recipeName || '',
        style: recipe.style || '',
        styleCode: recipe.styleCode || '',
        method: recipe.method || 'all_grain',
        batchSize: recipe.batchSize || 20,
        boilTimeMinutes: recipe.boilTimeMinutes || 60,
        efficiency: recipe.efficiency || 75,
        notes: recipe.notes || '',
      });
    } catch {
      setApiError('Failed to load recipe');
    } finally {
      setFetchLoading(false);
    }
  };

  const calculateStats = () => {
    const totalGrainWeight = grains.reduce((sum, g) => sum + (g.weight || 0), 0);
    const avgPotential = grains.length > 0
      ? grains.reduce((sum, g) => sum + (g.potentialExtract || 1.037) * (g.weight || 0), 0) / totalGrainWeight
      : 1.037;
    
    const grainPoints = (avgPotential - 1) * 1000;
    const efficiencyDecimal = formData.efficiency / 100;
    const ogPoints = grainPoints * efficiencyDecimal * (totalGrainWeight / formData.batchSize);
    const og = 1 + ogPoints / 1000;
    
    const avgAttenuation = yeasts.length > 0
      ? yeasts.reduce((sum, y) => sum + (y.attenuation || 75), 0) / yeasts.length / 100
      : 0.75;
    
    const fgPoints = ogPoints * (1 - avgAttenuation);
    const fg = 1 + fgPoints / 1000;
    
    const abv = (og - fg) * 131.25;
    
    const totalIbu = hops.reduce((sum, h) => {
      const weight = h.weight || 0;
      const alphaAcid = h.alphaAcid || 0;
      const time = h.time || 0;
      return sum + (weight * alphaAcid * time * 0.1) / formData.batchSize;
    }, 0);
    
    const totalLovibond = grains.reduce((sum, g) => sum + (g.lovibond || 0) * (g.weight || 0), 0);
    const srm = totalGrainWeight > 0 ? 1.4922 * Math.pow(totalLovibond / totalGrainWeight * totalGrainWeight, 0.6859) : 0;
    
    const calories = Math.round(og * 1000 * 0.82 + fg * 1000 * 0.18) * 3.55 / 10;

    return {
      og: isNaN(og) ? 1.000 : og,
      fg: isNaN(fg) ? 1.000 : fg,
      abv: isNaN(abv) ? 0 : abv,
      ibu: isNaN(totalIbu) ? 0 : totalIbu,
      srm: isNaN(srm) ? 0 : srm,
      calories: isNaN(calories) ? 0 : Math.round(calories),
    };
  };

  const stats = calculateStats();

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.recipeName.trim()) {
      newErrors.recipeName = 'Recipe name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    setApiError(null);

    const recipeData = {
      ...formData,
      estimatedOg: stats.og,
      estimatedFg: stats.fg,
      estimatedAbv: stats.abv,
      estimatedIbu: stats.ibu,
      estimatedSrm: stats.srm,
      estimatedCalories: stats.calories,
    };

    try {
      if (isEditMode && id) {
        await recipeAPI.updateRecipe(id, recipeData);
      } else {
        await recipeAPI.createRecipe(recipeData);
      }
      navigate('/recipes');
    } catch {
      setApiError('Failed to save recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addGrain = () => {
    setGrains([...grains, { name: '', weight: 0, lovibond: 0, potentialExtract: 1.037 }]);
  };

  const updateGrain = (index: number, grain: GrainData) => {
    const newGrains = [...grains];
    newGrains[index] = grain;
    setGrains(newGrains);
  };

  const removeGrain = (index: number) => {
    setGrains(grains.filter((_, i) => i !== index));
  };

  const addHop = () => {
    setHops([...hops, { name: '', weight: 0, time: 60, alphaAcid: 0, form: 'pellet' }]);
  };

  const updateHop = (index: number, hop: HopData) => {
    const newHops = [...hops];
    newHops[index] = hop;
    setHops(newHops);
  };

  const removeHop = (index: number) => {
    setHops(hops.filter((_, i) => i !== index));
  };

  const addYeast = () => {
    setYeasts([...yeasts, { name: '', type: 'ale', form: 'liquid', attenuation: 75 }]);
  };

  const updateYeast = (index: number, yeast: YeastData) => {
    const newYeasts = [...yeasts];
    newYeasts[index] = yeast;
    setYeasts(newYeasts);
  };

  const removeYeast = (index: number) => {
    setYeasts(yeasts.filter((_, i) => i !== index));
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-amber-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-amber-700 text-lg">Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-amber-800 mb-6">
            {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
          </h1>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-amber-800 mb-4">Recipe Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipeName"
                    value={formData.recipeName}
                    onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200 ${
                      errors.recipeName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.recipeName && (
                    <p className="mt-1 text-sm text-red-500">{errors.recipeName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
                    Style
                  </label>
                  <input
                    type="text"
                    id="style"
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="styleCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Style Code
                  </label>
                  <input
                    type="text"
                    id="styleCode"
                    value={formData.styleCode}
                    onChange={(e) => setFormData({ ...formData, styleCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="method" className="block text-sm font-medium text-gray-700 mb-1">
                    Method
                  </label>
                  <select
                    id="method"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value as FormData['method'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  >
                    <option value="all_grain">All Grain</option>
                    <option value="partial_mash">Partial Mash</option>
                    <option value="extract">Extract</option>
                    <option value="biab">BIAB</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Size (L)
                  </label>
                  <input
                    type="number"
                    id="batchSize"
                    value={formData.batchSize}
                    onChange={(e) => setFormData({ ...formData, batchSize: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="boilTimeMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                    Boil Time (min)
                  </label>
                  <input
                    type="number"
                    id="boilTimeMinutes"
                    value={formData.boilTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, boilTimeMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="efficiency" className="block text-sm font-medium text-gray-700 mb-1">
                    Efficiency (%)
                  </label>
                  <input
                    type="number"
                    id="efficiency"
                    value={formData.efficiency}
                    onChange={(e) => setFormData({ ...formData, efficiency: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">Fermentables</h2>
                <button
                  type="button"
                  onClick={addGrain}
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  + Add Grain
                </button>
              </div>
              
              {grains.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No grains added yet</p>
              ) : (
                <div className="space-y-3">
                  {grains.map((grain, index) => (
                    <GrainInput
                      key={index}
                      grain={grain}
                      onChange={(updated) => updateGrain(index, updated)}
                      onRemove={() => removeGrain(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">Hops</h2>
                <button
                  type="button"
                  onClick={addHop}
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  + Add Hop
                </button>
              </div>
              
              {hops.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hops added yet</p>
              ) : (
                <div className="space-y-3">
                  {hops.map((hop, index) => (
                    <HopInput
                      key={index}
                      hop={hop}
                      onChange={(updated) => updateHop(index, updated)}
                      onRemove={() => removeHop(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-amber-800">Yeast</h2>
                <button
                  type="button"
                  onClick={addYeast}
                  className="text-amber-600 hover:text-amber-800 font-medium"
                >
                  + Add Yeast
                </button>
              </div>
              
              {yeasts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No yeast added yet</p>
              ) : (
                <div className="space-y-3">
                  {yeasts.map((yeast, index) => (
                    <YeastInput
                      key={index}
                      yeast={yeast}
                      onChange={(updated) => updateYeast(index, updated)}
                      onRemove={() => removeYeast(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-amber-800 mb-4">Calculated Stats</h2>
              <RecipeStats
                og={stats.og}
                fg={stats.fg}
                abv={stats.abv}
                ibu={stats.ibu}
                srm={stats.srm}
                calories={stats.calories}
              />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/recipes')}
                className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Recipe'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
