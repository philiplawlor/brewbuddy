import { formatTime } from '../../utils/formatTime';

interface HopCalloutProps {
  nextHop: { time: number; name: string; amount: number; unit: string } | null;
  timeUntilHop: number;
}

export function HopCallout({ nextHop, timeUntilHop }: HopCalloutProps) {
  if (!nextHop) return null;

  const formattedTime = formatTime(timeUntilHop);
  const isDue = timeUntilHop === 0;

  return (
    <div className={`border rounded-xl p-4 ${isDue ? 'bg-red-500/20 border-red-500' : ''}`}
      style={!isDue ? { backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-default)' } : undefined}
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>NEXT HOP ADDITION</div>
          <div className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>🌿 {nextHop.name} — {nextHop.amount} {nextHop.unit}</div>
        </div>
        <div className={`text-2xl font-bold ${isDue ? 'text-red-500' : ''}`}
          style={!isDue ? { color: 'var(--accent-primary)' } : undefined}
        >
          {isDue ? 'ADD NOW!' : formattedTime}
        </div>
      </div>
    </div>
  );
}
