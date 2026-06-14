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

type StepKey = 'basic' | 'ingredients' | 'instructions';

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

const steps: { key: StepKey; label: string; icon: JSX.Element }[] = [
  {
    key: 'basic',
    label: 'Basic Info',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'ingredients',
    label: 'Ingredients',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    key: 'instructions',
    label: 'Instructions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export function RecipeForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [currentStep, setCurrentStep] = useState<StepKey>('basic');
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

  const getStepIndex = (step: StepKey) => steps.findIndex(s => s.key === step);
  const currentStepIndex = getStepIndex(currentStep);

  const canGoNext = () => {
    if (currentStep === 'basic') return true;
    if (currentStep === 'ingredients') return true;
    return false;
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].key);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].key);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent-secondary/30 border-t-accent-secondary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-secondary text-lg font-display">Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary font-display">
              {isEditMode ? 'Edit Recipe' : 'Create New Recipe'}
            </h1>
            <p className="text-secondary mt-1">
              {isEditMode ? 'Update your recipe details' : 'Build your perfect brew'}
            </p>
          </div>

          {/* Step Indicator */}
          <div className="card-theme rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => setCurrentStep(step.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      currentStep === step.key
                        ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                        : index < currentStepIndex
                        ? 'text-accent-primary/60'
                        : 'text-muted hover:text-primary'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep === step.key
                        ? 'bg-accent-primary text-brewery-black'
                        : index < currentStepIndex
                        ? 'bg-accent-primary/30 text-accent-primary'
                        : 'bg-secondary text-muted'
                    }`}>
                      {index < currentStepIndex ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{step.label}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded ${
                      index < currentStepIndex ? 'bg-accent-primary/40' : 'bg-secondary'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {apiError && (
            <div className="bg-red-600/10 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg mb-6">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {currentStep === 'basic' && (
              <div className="card-theme rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-semibold text-primary font-display">Recipe Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="recipeName" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                      Recipe Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="recipeName"
                      placeholder="e.g., West Coast IPA"
                      value={formData.recipeName}
                      onChange={(e) => setFormData({ ...formData, recipeName: e.target.value })}
                      className={`input-theme w-full rounded-lg px-4 py-3 transition-all ${
                        errors.recipeName ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.recipeName && (
                      <p className="mt-1 text-sm text-red-400">{errors.recipeName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="style" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                      Style
                    </label>
                    <input
                      type="text"
                      id="style"
                      placeholder="e.g., American IPA"
                      value={formData.style}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      className="input-theme w-full rounded-lg px-4 py-3 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="styleCode" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                      Style Code
                    </label>
                    <input
                      type="text"
                      id="styleCode"
                      placeholder="e.g., 21A"
                      value={formData.styleCode}
                      onChange={(e) => setFormData({ ...formData, styleCode: e.target.value })}
                      className="input-theme w-full rounded-lg px-4 py-3 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="method" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                      Method
                    </label>
                    <select
                      id="method"
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value as FormData['method'] })}
                      className="input-theme w-full rounded-lg px-4 py-3 transition-all"
                    >
                      <option value="all_grain">All Grain</option>
                      <option value="partial_mash">Partial Mash</option>
                      <option value="extract">Extract</option>
                      <option value="biab">BIAB</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="batchSize" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                      Batch Size (L)
                    </label>
                    <input
                      type="number"
                      id="batchSize"
                      value={formData.batchSize}
                      onChange={(e) => setFormData({ ...formData, batchSize: parseFloat(e.target.value) || 0 })}
                      className="input-theme w-full rounded-lg px-4 py-3 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="boilTimeMinutes" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                      Boil Time (min)
                    </label>
                    <input
                      type="number"
                      id="boilTimeMinutes"
                      value={formData.boilTimeMinutes}
                      onChange={(e) => setFormData({ ...formData, boilTimeMinutes: parseInt(e.target.value) || 0 })}
                      className="input-theme w-full rounded-lg px-4 py-3 transition-all"
                    />
                  </div>

                  <div>
                    <label htmlFor="efficiency" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                      Efficiency (%)
                    </label>
                    <input
                      type="number"
                      id="efficiency"
                      value={formData.efficiency}
                      onChange={(e) => setFormData({ ...formData, efficiency: parseFloat(e.target.value) || 0 })}
                      className="input-theme w-full rounded-lg px-4 py-3 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Ingredients */}
            {currentStep === 'ingredients' && (
              <div className="space-y-6">
                {/* Grains */}
                <div className="card-theme rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary font-display">Fermentables</h2>
                    <button
                      type="button"
                      onClick={addGrain}
                      className="text-accent-primary hover:text-accent-hover text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Grain
                    </button>
                  </div>

                  {grains.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <svg className="w-12 h-12 mx-auto mb-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p>No grains added yet</p>
                    </div>
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

                {/* Hops */}
                <div className="card-theme rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary font-display">Hops</h2>
                    <button
                      type="button"
                      onClick={addHop}
                      className="text-accent-primary hover:text-accent-hover text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Hop
                    </button>
                  </div>

                  {hops.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <svg className="w-12 h-12 mx-auto mb-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      <p>No hops added yet</p>
                    </div>
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

                {/* Yeast */}
                <div className="card-theme rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-primary font-display">Yeast</h2>
                    <button
                      type="button"
                      onClick={addYeast}
                      className="text-accent-primary hover:text-accent-hover text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Yeast
                    </button>
                  </div>

                  {yeasts.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <svg className="w-12 h-12 mx-auto mb-3 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <p>No yeast added yet</p>
                    </div>
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

                {/* Live Stats */}
                <div className="card-theme rounded-2xl p-6">
                  <h2 className="text-xl font-semibold text-primary mb-4 font-display">Calculated Stats</h2>
                  <RecipeStats
                    og={stats.og}
                    fg={stats.fg}
                    abv={stats.abv}
                    ibu={stats.ibu}
                    srm={stats.srm}
                    calories={stats.calories}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Instructions */}
            {currentStep === 'instructions' && (
              <div className="card-theme rounded-2xl p-6 space-y-6">
                <h2 className="text-xl font-semibold text-primary font-display">Brewer Notes</h2>

                <div>
                  <label htmlFor="notes" className="block text-xs font-medium text-secondary mb-2 uppercase tracking-wider">
                    Notes &amp; Instructions
                  </label>
                  <textarea
                    id="notes"
                    rows={8}
                    placeholder="Add any brewing notes, special instructions, or observations..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input-theme w-full rounded-lg px-4 py-3 transition-all resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-secondary/30 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-accent-primary mb-3">Recipe Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted">Name:</span>{' '}
                      <span className="text-primary">{formData.recipeName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted">Style:</span>{' '}
                      <span className="text-primary">{formData.style || '—'}</span>
                    </div>
                    <div>
                      <span className="text-muted">Grains:</span>{' '}
                      <span className="text-primary">{grains.length} added</span>
                    </div>
                    <div>
                      <span className="text-muted">Hops:</span>{' '}
                      <span className="text-primary">{hops.length} added</span>
                    </div>
                    <div>
                      <span className="text-muted">Yeast:</span>{' '}
                      <span className="text-primary">{yeasts.length} added</span>
                    </div>
                  </div>
                </div>

                {/* Share Toggle */}
                <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
                  <div>
                    <p className="font-medium text-primary">Share with Community</p>
                    <p className="text-sm text-muted">Make this recipe visible to other brewers</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic || false}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-accent-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate('/recipes')}
                className="px-6 py-3 border border-secondary text-secondary hover:text-primary hover:border-primary rounded-lg transition duration-200"
              >
                Cancel
              </button>

              <div className="flex space-x-3">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-6 py-3 bg-secondary/50 hover:bg-secondary text-primary font-semibold rounded-lg transition duration-200"
                  >
                    Previous
                  </button>
                )}

                {currentStepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={!canGoNext()}
                    className="px-6 py-3 bg-accent-secondary hover:bg-accent-hover text-primary font-semibold rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-accent-secondary hover:bg-accent-hover text-primary font-semibold rounded-lg transition duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Recipe
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
