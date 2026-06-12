const STEPS = [
  { id: 'MASH', label: 'Mash', duration: '60 min' },
  { id: 'BOIL', label: 'Boil', duration: '60 min' },
  { id: 'WHIRLPOOL', label: 'Whirlpool', duration: '15 min' },
  { id: 'COOL', label: 'Cool & Transfer', duration: 'manual' },
];

interface UpcomingStepsProps {
  currentStep: string;
}

export function UpcomingSteps({ currentStep }: UpcomingStepsProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);
  const upcoming = STEPS.slice(currentIndex + 1);

  if (upcoming.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="text-xs text-gray-400 mb-3">UPCOMING</div>
      {upcoming.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-center gap-3 py-2 ${index === 0 ? 'opacity-100' : 'opacity-50'}`}
        >
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <div className="flex-1 text-sm">{step.label}</div>
          <div className="text-sm text-gray-400">{step.duration}</div>
        </div>
      ))}
    </div>
  );
}
