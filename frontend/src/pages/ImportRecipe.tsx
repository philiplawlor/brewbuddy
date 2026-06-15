import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { recipeAPI } from '../services/api';

interface ParsedRecipe {
  recipe: Record<string, any>;
  hops: Array<{ name: string; alpha?: number; amount?: number; time?: number; use?: string; form?: string; origin?: string; notes?: string }>;
  fermentables: Array<{ name: string; amount?: number; yield?: number; color?: number; type?: string; origin?: string; supplier?: string }>;
  yeasts: Array<{ name: string; type?: string; form?: string; amount?: number; laboratory?: string; productId?: string; attenuation?: number }>;
  mashProfile?: {
    name?: string;
    grainTemp?: number;
    steps: Array<{ name: string; type: string; stepTemp?: number; stepTime?: number }>;
  };
  styleProfile?: Record<string, any>;
  equipment?: Record<string, any>;
  instructions?: Array<Record<string, any>>;
  miscIngredients?: Array<Record<string, any>>;
}

export function ImportRecipe() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRecipe | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError('');
    setParsed(null);

    if (file.size > 1_048_576) {
      setError('File too large. Maximum size is 1MB.');
      return;
    }

    if (!file.name.endsWith('.xml') && !file.name.endsWith('.beerxml') && !file.name.endsWith('.qbrew')) {
      setError('Please select a .xml, .beerxml, or .qbrew file.');
      return;
    }

    const content = await file.text();
    await parseXml(content);
  }, []);

  const parseXml = async (xml: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await recipeAPI.importRecipe(xml);
      setParsed(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to parse BeerXML file. Please check the file format.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!parsed) return;
    setImporting(true);
    try {
      const response = await recipeAPI.importRecipeConfirm({
        ...parsed.recipe,
        hops: parsed.hops,
        fermentables: parsed.fermentables,
        yeasts: parsed.yeasts,
        mashProfile: parsed.mashProfile,
        styleProfile: parsed.styleProfile,
        equipment: parsed.equipment,
        instructions: parsed.instructions,
        miscIngredients: parsed.miscIngredients,
      });
      navigate(`/recipes/${response.data.recipe._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to import recipe. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/recipes"
            className="text-secondary hover:text-accent-primary font-medium mb-4 inline-flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Recipes
          </Link>
          <h1 className="font-display text-3xl font-bold text-primary mt-2">
            Import BeerXML Recipe
          </h1>
          <p className="text-secondary mt-1">
            Import recipes from Brewfather, BeerSmith, qBrew, BrewTarget, and other BeerXML-compatible tools
          </p>
        </div>

        {/* Upload Zone */}
        {!parsed && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`card-theme rounded-xl p-12 border-2 border-dashed cursor-pointer transition-all duration-200 text-center ${
              isDragOver
                ? 'border-accent-primary bg-accent-primary/5'
                : 'border-default hover:border-hover hover:bg-primary/5'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.beerxml,.qbrew"
              onChange={handleFileInput}
              className="hidden"
            />
            <div className="text-5xl mb-4">📄</div>
            <h3 className="font-display text-xl font-semibold text-primary mb-2">
              {isDragOver ? 'Drop your file here' : 'Drag & drop a BeerXML file'}
            </h3>
            <p className="text-secondary mb-4">
              or click to browse
            </p>
            <p className="text-muted text-sm">
              Supports .xml and .beerxml files up to 1MB
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-secondary">Parsing BeerXML file...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Preview */}
        {parsed && !loading && (
          <div className="space-y-6">
            <div className="card-theme rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold text-primary">Recipe Preview</h2>
                <button
                  onClick={() => { setParsed(null); }}
                  className="text-sm text-secondary hover:text-accent-primary transition-colors"
                >
                  Choose different file
                </button>
              </div>

              {/* Recipe Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Name</p>
                  <p className="text-primary font-medium">{parsed.recipe.recipeName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Style</p>
                  <p className="text-primary font-medium">{parsed.recipe.style || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Method</p>
                  <p className="text-primary font-medium capitalize">{parsed.recipe.method?.replace('_', ' ') || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Batch Size</p>
                  <p className="text-primary font-medium">{parsed.recipe.batchSize ? `${parsed.recipe.batchSize} L` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Boil Time</p>
                  <p className="text-primary font-medium">{parsed.recipe.boilTimeMinutes ? `${parsed.recipe.boilTimeMinutes} min` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider">Efficiency</p>
                  <p className="text-primary font-medium">{parsed.recipe.efficiency ? `${parsed.recipe.efficiency}%` : '—'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'OG', value: parsed.recipe.estimatedOg?.toFixed(3) },
                  { label: 'FG', value: parsed.recipe.estimatedFg?.toFixed(3) },
                  { label: 'ABV', value: parsed.recipe.estimatedAbv ? `${parsed.recipe.estimatedAbv.toFixed(1)}%` : undefined },
                  { label: 'IBU', value: parsed.recipe.estimatedIbu?.toFixed(1) },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-2 bg-primary/50 rounded-lg border border-default/30">
                    <p className="text-xs text-muted uppercase">{label}</p>
                    <p className="text-sm font-bold text-primary">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {/* Ingredients Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Fermentables ({parsed.fermentables.length})</p>
                  <ul className="text-sm text-primary space-y-0.5">
                    {parsed.fermentables.slice(0, 5).map((f, i) => (
                      <li key={i}>{f.name}{f.amount ? ` — ${f.amount}kg` : ''}</li>
                    ))}
                    {parsed.fermentables.length > 5 && <li className="text-muted">+{parsed.fermentables.length - 5} more</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Hops ({parsed.hops.length})</p>
                  <ul className="text-sm text-primary space-y-0.5">
                    {parsed.hops.slice(0, 5).map((h, i) => (
                      <li key={i}>{h.name}{h.time ? ` — ${h.time}min` : ''}</li>
                    ))}
                    {parsed.hops.length > 5 && <li className="text-muted">+{parsed.hops.length - 5} more</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Yeast ({parsed.yeasts.length})</p>
                  <ul className="text-sm text-primary space-y-0.5">
                    {parsed.yeasts.slice(0, 3).map((y, i) => (
                      <li key={i}>{y.name}</li>
                    ))}
                    {parsed.yeasts.length > 3 && <li className="text-muted">+{parsed.yeasts.length - 3} more</li>}
                  </ul>
                </div>
              </div>

              {/* Notes */}
              {parsed.recipe.notes && (
                <div className="mt-4 pt-4 border-t border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-sm text-primary/80 whitespace-pre-wrap">{parsed.recipe.notes}</p>
                </div>
              )}

              {/* Brewer */}
              {parsed.recipe.brewer && (
                <div className="mt-4 pt-4 border-t border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Brewer</p>
                  <p className="text-sm text-primary/80">{parsed.recipe.brewer}</p>
                </div>
              )}

              {/* Taste Notes */}
              {parsed.recipe.tasteNotes && (
                <div className="mt-4 pt-4 border-t border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Taste Notes</p>
                  <p className="text-sm text-primary/80 whitespace-pre-wrap">{parsed.recipe.tasteNotes}</p>
                </div>
              )}

              {/* Style Profile */}
              {parsed.styleProfile && (
                <div className="mt-4 pt-4 border-t border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider mb-2">Style Profile</p>
                  <div className="space-y-2">
                    {parsed.styleProfile.aroma && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Aroma</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.aroma}</p>
                      </div>
                    )}
                    {parsed.styleProfile.appearance && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Appearance</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.appearance}</p>
                      </div>
                    )}
                    {parsed.styleProfile.flavor && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Flavor</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.flavor}</p>
                      </div>
                    )}
                    {parsed.styleProfile.mouthfeel && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Mouthfeel</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.mouthfeel}</p>
                      </div>
                    )}
                    {parsed.styleProfile.overallImpression && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Overall Impression</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.overallImpression}</p>
                      </div>
                    )}
                    {parsed.styleProfile.profile && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Profile</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.profile}</p>
                      </div>
                    )}
                    {parsed.styleProfile.ingredients && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Ingredients</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.ingredients}</p>
                      </div>
                    )}
                    {parsed.styleProfile.examples && (
                      <div>
                        <p className="text-xs font-medium text-accent-primary">Examples</p>
                        <p className="text-sm text-primary/80">{parsed.styleProfile.examples}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {parsed.equipment && parsed.equipment.name && (
                <div className="mt-4 pt-4 border-t border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Equipment</p>
                  <p className="text-sm text-primary/80">{parsed.equipment.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-primary/60">
                    {parsed.equipment.tunVolume && <span>Tun Volume: {parsed.equipment.tunVolume} L</span>}
                    {parsed.equipment.boilKettleVolume && <span>Boil Kettle: {parsed.equipment.boilKettleVolume} L</span>}
                    {parsed.equipment.evapRate && <span>Evap Rate: {parsed.equipment.evapRate} L/hr</span>}
                    {parsed.equipment.lauterDeadSpace && <span>Dead Space: {parsed.equipment.lauterDeadSpace} L</span>}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {parsed.instructions && parsed.instructions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Instructions ({parsed.instructions.length} steps)</p>
                  <ol className="text-sm text-primary/80 space-y-1 list-decimal list-inside">
                    {parsed.instructions.map((inst, i) => (
                      <li key={i}>{inst.name || `Step ${i + 1}`}{inst.time ? ` (${inst.time} min)` : ''}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Misc Ingredients */}
              {parsed.miscIngredients && parsed.miscIngredients.length > 0 && (
                <div className="mt-4 pt-4 border-t border-default/30">
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Misc Ingredients ({parsed.miscIngredients.length})</p>
                  <ul className="text-sm text-primary/80 space-y-0.5">
                    {parsed.miscIngredients.map((m, i) => (
                      <li key={i}>{m.name}{m.amount ? ` — ${m.amount}` : ''}{m.use ? ` (${m.use})` : ''}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setParsed(null); }}
                className="px-6 py-2.5 rounded-lg border border-default text-secondary hover:border-hover hover:text-primary transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={importing}
                className="bg-accent-primary hover:bg-accent-hover text-brewery-black font-semibold py-2.5 px-6 rounded-lg transition duration-200 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import Recipe'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
