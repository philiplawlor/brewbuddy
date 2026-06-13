import { useParams } from 'react-router-dom';
import { StepTimer } from '../components/Timer/StepTimer';
import { HopCallout } from '../components/Timer/HopCallout';
import { UpcomingSteps } from '../components/Timer/UpcomingSteps';
import { EventLogger } from '../components/Timer/EventLogger';
import { useBrewTimer } from '../hooks/useBrewTimer';

interface BrewTimerProps {
  sessionId?: string;
}

export function BrewTimer({ sessionId: propSessionId }: BrewTimerProps) {
  const { id } = useParams<{ id: string }>();
  const sessionId = propSessionId || id || '';
  // In real app, fetch session from API
  const mockSession = {
    _id: sessionId,
    hopAdditions: [
      { time: 60, name: 'Cascade', amount: 1, unit: 'oz' },
      { time: 15, name: 'Citra', amount: 1, unit: 'oz' },
    ],
  };

  const {
    currentStep,
    timeRemaining,
    isRunning,
    start,
    pause,
    skip,
  } = useBrewTimer(mockSession as any);

  const nextHop = mockSession.hopAdditions[0];
  const timeUntilHop = nextHop ? nextHop.time * 60 : 0;

  const handleLogEvent = (event: any) => {
    console.log('Logging event:', event);
    // POST to API
  };

  return (
    <div className="min-h-screen text-primary p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-secondary">Brew Day #{sessionId.slice(-3)}</div>
        <div className="flex gap-2">
          <button className="bg-primary/10 px-3 py-1 rounded text-sm">⚙️ Settings</button>
          <button onClick={skip} className="bg-primary/10 px-3 py-1 rounded text-sm">⏭️ Skip</button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex justify-between mb-6 text-sm">
        <div className={currentStep === 'MASH' ? 'text-green-500 font-bold' : 'text-muted'}>✓ Mash</div>
        <div className={currentStep === 'BOIL' ? 'text-accent-primary font-bold' : 'text-muted'}>→ Boil</div>
        <div className={currentStep === 'WHIRLPOOL' ? 'text-blue-500 font-bold' : 'text-muted'}>Whirlpool</div>
        <div className={currentStep === 'COOL' ? 'text-purple-500 font-bold' : 'text-muted'}>Cool</div>
      </div>

      {/* Timer */}
      <StepTimer
        step={currentStep}
        timeRemaining={timeRemaining}
        isRunning={isRunning}
        onStart={start}
        onPause={pause}
      />

      {/* Hop Callout */}
      <div className="mt-6">
        <HopCallout nextHop={nextHop} timeUntilHop={timeUntilHop} />
      </div>

      {/* Upcoming Steps */}
      <UpcomingSteps currentStep={currentStep} />

      {/* Event Logger FAB */}
      <EventLogger onLogEvent={handleLogEvent} />
    </div>
  );
}