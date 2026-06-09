export interface GrainData {
  name: string;
  weight: number;
  lovibond: number;
  potentialExtract: number;
}

interface GrainInputProps {
  grain: GrainData;
  onChange: (grain: GrainData) => void;
  onRemove: () => void;
}

export function GrainInput({ grain, onChange, onRemove }: GrainInputProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
      <input
        type="text"
        aria-label="Grain Name"
        value={grain.name}
        onChange={(e) => onChange({ ...grain, name: e.target.value })}
        placeholder="Grain name"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="number"
        aria-label="Weight"
        value={grain.weight || ''}
        onChange={(e) => onChange({ ...grain, weight: parseFloat(e.target.value) || 0 })}
        placeholder="0"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="number"
        aria-label="Lovibond"
        value={grain.lovibond || ''}
        onChange={(e) => onChange({ ...grain, lovibond: parseFloat(e.target.value) || 0 })}
        placeholder="°L"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <button
        type="button"
        onClick={onRemove}
        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition"
      >
        Remove
      </button>
    </div>
  );
}
