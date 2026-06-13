interface BrewStepProgressProps {
  steps: string[];
  currentStep: number;
}

const STEP_ICONS: Record<string, string> = {
  mash: '🌾',
  boil: '🔥',
  whirlpool: '🌀',
  cool: '❄️',
  transfer: '🫗',
};

export function BrewStepProgress({ steps, currentStep }: BrewStepProgressProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => {
        const isComplete = index < currentStep;
        const isCurrent = index === currentStep;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all duration-300 ${
                  isComplete
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-accent-primary border-accent-primary text-brewery-black scale-110 shadow-lg'
                    : 'bg-primary border-secondary text-secondary'
                }`}
              >
                {isComplete ? '✓' : STEP_ICONS[step] || (index + 1)}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium capitalize ${
                  isCurrent
                    ? 'text-accent-primary'
                    : isComplete
                    ? 'text-green-600'
                    : 'text-secondary'
                }`}
              >
                {step}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div
                  className={`h-0.5 rounded transition-all duration-300 ${
                    isComplete ? 'bg-green-500' : 'bg-secondary'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
