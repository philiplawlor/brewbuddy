import { formatTime } from '../../utils/formatTime';

interface StepTimerProps {
  step: string;
  timeRemaining: number;
  isRunning: boolean;
  onStart?: () => void;
  onPause?: () => void;
}

export function StepTimer({ step, timeRemaining, isRunning, onStart, onPause }: StepTimerProps) {
  const formattedTime = formatTime(timeRemaining);

  return (
    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-center text-white">
      <div className="text-sm opacity-80 mb-2">
        🔥 <span>{step}</span>
      </div>
      <div className="text-7xl font-mono font-bold">{formattedTime}</div>
      <div className="text-sm opacity-80 mt-2">remaining</div>

      <div className="mt-6 flex justify-center gap-4">
        {isRunning ? (
          <button
            onClick={onPause}
            className="bg-white/20 border-2 border-white text-white px-6 py-3 rounded-xl font-bold text-lg"
          >
            Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            className="bg-white/20 border-2 border-white text-white px-6 py-3 rounded-xl font-bold text-lg"
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}
