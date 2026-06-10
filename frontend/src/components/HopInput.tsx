export interface HopData {
  name: string;
  weight: number;
  time: number;
  alphaAcid: number;
  form: string;
}

interface HopInputProps {
  hop: HopData;
  onChange: (hop: HopData) => void;
  onRemove: () => void;
}

export function HopInput({ hop, onChange, onRemove }: HopInputProps) {
  return (
    <div className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-lg">
      <input
        type="text"
        aria-label="Hop Name"
        value={hop.name}
        onChange={(e) => onChange({ ...hop, name: e.target.value })}
        placeholder="Hop name"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="number"
        aria-label="Weight"
        value={hop.weight || ''}
        onChange={(e) => onChange({ ...hop, weight: parseFloat(e.target.value) || 0 })}
        placeholder="g"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="number"
        aria-label="Time"
        value={hop.time || ''}
        onChange={(e) => onChange({ ...hop, time: parseInt(e.target.value) || 0 })}
        placeholder="min"
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
      />
      <input
        type="number"
        aria-label="Alpha Acid"
        value={hop.alphaAcid || ''}
        onChange={(e) => onChange({ ...hop, alphaAcid: parseFloat(e.target.value) || 0 })}
        placeholder="%AA"
        step="0.1"
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
