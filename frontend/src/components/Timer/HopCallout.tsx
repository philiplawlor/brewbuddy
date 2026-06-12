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
    <div className={`border rounded-xl p-4 ${isDue ? 'bg-red-500/20 border-red-500' : 'bg-white/5 border-white/10'}`}>
      <div className="flex justify-between items-center">
        <div>
          <div className="text-xs text-gray-400">NEXT HOP ADDITION</div>
          <div className="text-lg font-bold mt-1">🌿 {nextHop.name} — {nextHop.amount} {nextHop.unit}</div>
        </div>
        <div className={`text-2xl font-bold ${isDue ? 'text-red-500' : 'text-amber-500'}`}>
          {isDue ? 'ADD NOW!' : formattedTime}
        </div>
      </div>
    </div>
  );
}
