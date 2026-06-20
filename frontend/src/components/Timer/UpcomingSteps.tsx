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
      <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>UPCOMING</div>
      {upcoming.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-center gap-3 py-2 ${index === 0 ? 'opacity-100' : 'opacity-50'}`}
        >
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-muted)' }} />
          <div className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>{step.label}</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{step.duration}</div>
        </div>
      ))}
    </div>
  );
}
