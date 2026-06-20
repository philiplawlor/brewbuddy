import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { recipeAPI, brewSessionAPI } from '../services/api';
import { Recipe } from '../types';

const METHOD_OPTIONS = [
  { value: 'all_grain', label: 'All Grain' },
  { value: 'partial_mash', label: 'Partial Mash' },
  { value: 'extract', label: 'Extract' },
  { value: 'biab', label: 'BIAB' },
];

export function BrewSessionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedRecipeId = searchParams.get('recipeId');

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    recipeId: preselectedRecipeId || '',
    sessionName: '',
    brewDate: new Date().toISOString().split('T')[0],
    batchNumber: '',
    method: '',
    batchSize: '',
    batchSizeUnit: 'L' as 'L' | 'gal' | 'bbl',
    notes: '',
  });

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await recipeAPI.getRecipes({ limit: 100 });
      setRecipes(response.data.recipes || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipeId) {
      setError('Please select a recipe');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload: any = {
        recipeId: formData.recipeId,
        brewDate: formData.brewDate,
      };
      if (formData.sessionName) payload.sessionName = formData.sessionName;
      if (formData.batchNumber) payload.batchNumber = formData.batchNumber;
      if (formData.method) payload.method = formData.method;
      if (formData.batchSize) payload.batchSize = parseFloat(formData.batchSize);
      if (formData.batchSizeUnit) payload.batchSizeUnit = formData.batchSizeUnit;
      if (formData.notes) payload.notes = formData.notes;

      const response = await brewSessionAPI.createSession(payload);
      navigate(`/brew-sessions/${response.data._id}`);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to create brew session';
      const details = err.response?.data?.details;
      setError(details ? `${msg}: ${details.join(', ')}` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-current rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <p className="text-lg font-display" style={{ color: 'var(--text-secondary)' }}>Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link
            to="/brew-sessions"
            className="inline-flex items-center mb-6 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Brew Sessions
          </Link>

          {/* Form Card */}
          <div className="card-theme rounded-2xl overflow-hidden">
            <div className="p-8 border-b" style={{ background: 'linear-gradient(135deg, var(--tag-bg), transparent)', borderColor: 'var(--border-default)' }}>
              <h1 className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
                New Brew Session
              </h1>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                Start tracking a new brew day
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Error */}
              {error && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                  {error}
                </div>
              )}

              {/* Recipe Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Recipe <span className="text-red-500">*</span>
                </label>
                {recipes.length === 0 ? (
                  <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-default)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      No recipes found.{' '}
                      <Link to="/recipes/new" className="font-medium" style={{ color: 'var(--accent-primary)' }}>
                        Create a recipe first
                      </Link>
                    </p>
                  </div>
                ) : (
                  <select
                    name="recipeId"
                    value={formData.recipeId}
                    onChange={handleChange}
                    required
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="">Select a recipe...</option>
                    {recipes.map(recipe => (
                      <option key={recipe._id} value={recipe._id}>
                        {recipe.recipeName} {recipe.style ? `(${recipe.style})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Session Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Session Name
                </label>
                <input
                  type="text"
                  name="sessionName"
                  value={formData.sessionName}
                  onChange={handleChange}
                  placeholder="e.g., Summer IPA Batch 3"
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Brew Date + Batch Number */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Brew Date
                  </label>
                  <input
                    type="date"
                    name="brewDate"
                    value={formData.brewDate}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Batch Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    placeholder="e.g., 2026-001"
                    className="w-full p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Brew Method
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">Select method...</option>
                  {METHOD_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Batch Size */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Batch Size
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="batchSize"
                    value={formData.batchSize}
                    onChange={handleChange}
                    placeholder="20"
                    step="0.1"
                    min="0"
                    className="flex-1 p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <select
                    name="batchSizeUnit"
                    value={formData.batchSizeUnit}
                    onChange={handleChange}
                    className="p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-default)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="L">Liters</option>
                    <option value="gal">Gallons</option>
                    <option value="bbl">Barrels</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any notes for this brew session..."
                  rows={4}
                  className="w-full p-3 rounded-lg border resize-none"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4">
                <Link
                  to="/brew-sessions"
                  className="px-6 py-3 rounded-lg font-semibold transition duration-200"
                  style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)' }}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting || !formData.recipeId}
                  className="px-6 py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--brewery-black)' }}
                >
                  {submitting ? 'Creating...' : 'Create Brew Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
