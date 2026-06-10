export interface YeastData {
  name: string;
  type: string;
  form: string;
  attenuation: number;
}

interface YeastInputProps {
  yeast: YeastData;
  onChange: (yeast: YeastData) => void;
  onRemove: () => void;
}

export function YeastInput({ yeast, onChange, onRemove }: YeastInputProps) {
  return (
    <div className="grid grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg">
      <input
        type="text"
        aria-label="Yeast Name"
        value={yeast.name}
        onChange={(e) => onChange({ ...yeast, name: e.target.value })}
        placeholder="Yeast name"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="text"
        aria-label="Yeast Type"
        value={yeast.type}
        onChange={(e) => onChange({ ...yeast, type: e.target.value })}
        placeholder="Ale/Lager"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="number"
        aria-label="Attenuation"
        value={yeast.attenuation || ''}
        onChange={(e) => onChange({ ...yeast, attenuation: parseFloat(e.target.value) || 0 })}
        placeholder="%"
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
