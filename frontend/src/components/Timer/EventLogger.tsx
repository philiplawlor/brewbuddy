import { useState } from 'react';

interface EventLoggerProps {
  onLogEvent: (event: { eventType: string; value?: number; notes?: string }) => void;
}

const EVENT_TYPES = [
  { id: 'GRAVITY', label: 'Gravity', icon: '💧' },
  { id: 'TEMPERATURE', label: 'Temperature', icon: '🌡️' },
  { id: 'NOTES', label: 'Notes', icon: '📝' },
  { id: 'MASH_PH', label: 'Mash pH', icon: '🧪' },
  { id: 'VOLUME', label: 'Volume', icon: '📏' },
];

export function EventLogger({ onLogEvent }: EventLoggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');

  const handleLog = () => {
    onLogEvent({
      eventType: selectedType || 'NOTES',
      value: value ? parseFloat(value) : undefined,
      notes: notes || undefined,
    });
    setIsOpen(false);
    setSelectedType(null);
    setValue('');
    setNotes('');
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-green-500 text-white text-3xl shadow-lg"
      >
        +
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-80">
            <h3 className="text-lg font-bold text-white mb-4">Log Event</h3>

            <div className="space-y-2 mb-4">
              {EVENT_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedType === type.id ? 'bg-amber-500/20 border border-amber-500' : 'bg-white/5'
                  }`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>

            {(selectedType === 'GRAVITY' || selectedType === 'TEMPERATURE') && (
              <input
                type="number"
                placeholder="Value"
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full p-3 rounded-lg bg-white/5 text-white mb-4"
              />
            )}

            <textarea
              placeholder="Notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/5 text-white mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-lg bg-white/10 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleLog}
                className="flex-1 py-3 rounded-lg bg-amber-500 text-white font-bold"
              >
                Log
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
