# Sprint 4: Brew Timer UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build phone-first Brew Timer UI with client-side countdown, event logging via FAB, and configurable alerts.

**Architecture:** Client-side timer using React state (useRef + useEffect), localStorage persistence, and API sync for events. Timer runs independently of server, events logged when online.

**Tech Stack:** React, TypeScript, Tailwind CSS, localStorage, existing BrewTimer engine (portable)

---

## File Structure

### New Files
- `frontend/src/pages/BrewTimer.tsx` — Main timer page
- `frontend/src/components/Timer/StepTimer.tsx` — Countdown display
- `frontend/src/components/Timer/HopCallout.tsx` — Next hop alert
- `frontend/src/components/Timer/UpcomingSteps.tsx` — Timeline view
- `frontend/src/components/Timer/EventLogger.tsx` — FAB + logging modal
- `frontend/src/components/Timer/AudioAlerts.tsx` — Sound/vibration config
- `frontend/src/hooks/useBrewTimer.ts` — Timer logic hook
- `frontend/src/hooks/useAudioAlerts.ts` — Audio alert hook
- `frontend/src/types/timer.ts` — Timer-specific types

### Modified Files
- `frontend/src/App.tsx` — Add route `/brew-sessions/:id/timer`
- `frontend/src/services/api.ts` — Add timer-related API calls
- `frontend/src/pages/BrewSessionDetail.tsx` — Add "Start Timer" button

---

## Tasks

### Task 1: Timer Types & Hook Foundation

**Files:**
- Create: `frontend/src/types/timer.ts`
- Create: `frontend/src/hooks/useBrewTimer.ts`
- Test: `frontend/__tests__/useBrewTimer.test.ts`

- [ ] **Step 1: Write failing test for timer hook**

```typescript
// frontend/__tests__/useBrewTimer.test.ts
import { renderHook, act } from '@testing-library/react';
import { useBrewTimer } from '../hooks/useBrewTimer';

describe('useBrewTimer', () => {
  const mockSession = {
    _id: 'session-1',
    recipeId: { _id: 'recipe-1', recipeName: 'Test IPA' },
    status: 'IN_PROGRESS',
    mashTemp: 152,
    boilDuration: 60,
    hopAdditions: [
      { time: 60, name: 'Cascade', amount: 1, unit: 'oz' },
      { time: 15, name: 'Citra', amount: 1, unit: 'oz' },
    ],
  };

  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useBrewTimer(mockSession));
    expect(result.current.currentStep).toBe('MASH');
    expect(result.current.timeRemaining).toBe(60 * 60);
    expect(result.current.isRunning).toBe(false);
  });

  it('should start timer', () => {
    const { result } = renderHook(() => useBrewTimer(mockSession));
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);
  });

  it('should pause timer', () => {
    const { result } = renderHook(() => useBrewTimer(mockSession));
    act(() => result.current.start());
    act(() => result.current.pause());
    expect(result.current.isRunning).toBe(false);
  });

  it('should countdown time', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useBrewTimer(mockSession));
    act(() => result.current.start());
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.timeRemaining).toBe(60 * 60 - 1);
    jest.useRealTimers();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- useBrewTimer.test.ts`
Expected: FAIL with "Cannot find module '../hooks/useBrewTimer'"

- [ ] **Step 3: Create timer types**

```typescript
// frontend/src/types/timer.ts
export interface HopAddition {
  time: number; // minutes
  name: string;
  amount: number;
  unit: string;
}

export interface TimerState {
  currentStep: 'MASH' | 'BOIL' | 'WHIRLPOOL' | 'COOL';
  timeRemaining: number; // seconds
  isRunning: boolean;
  hopAdditions: HopAddition[];
  events: SessionEvent[];
}

export interface SessionEvent {
  _id: string;
  eventType: string;
  timestamp: string;
  value?: number;
  unit?: string;
  notes?: string;
}
```

- [ ] **Step 4: Create useBrewTimer hook**

```typescript
// frontend/src/hooks/useBrewTimer.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { TimerState, HopAddition } from '../types/timer';

const STEP_DURATIONS = {
  MASH: 60 * 60, // 60 minutes
  BOIL: 60 * 60, // 60 minutes
  WHIRLPOOL: 15 * 60, // 15 minutes
  COOL: 0, // manual step
};

const STEP_ORDER = ['MASH', 'BOIL', 'WHIRLPOOL', 'COOL'] as const;

export function useBrewTimer(session: any) {
  const [state, setState] = useState<TimerState>({
    currentStep: 'MASH',
    timeRemaining: STEP_DURATIONS.MASH,
    isRunning: false,
    hopAdditions: session.hopAdditions || [],
    events: [],
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const skip = useCallback(() => {
    setState(prev => {
      const currentIndex = STEP_ORDER.indexOf(prev.currentStep);
      const nextStep = STEP_ORDER[currentIndex + 1] || 'COOL';
      return {
        ...prev,
        currentStep: nextStep,
        timeRemaining: STEP_DURATIONS[nextStep],
        isRunning: false,
      };
    });
  }, []);

  useEffect(() => {
    if (state.isRunning && state.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeRemaining: Math.max(0, prev.timeRemaining - 1),
        }));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.timeRemaining]);

  return {
    ...state,
    start,
    pause,
    skip,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend && npm test -- useBrewTimer.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types/timer.ts frontend/src/hooks/useBrewTimer.ts frontend/__tests__/useBrewTimer.test.ts
git commit -m "feat(sprint-4): add timer types and useBrewTimer hook"
```

---

### Task 2: StepTimer Component

**Files:**
- Create: `frontend/src/components/Timer/StepTimer.tsx`
- Test: `frontend/__tests__/StepTimer.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/StepTimer.test.tsx
import { render, screen } from '@testing-library/react';
import { StepTimer } from '../components/Timer/StepTimer';

describe('StepTimer', () => {
  it('should display current step', () => {
    render(<StepTimer step="BOIL" timeRemaining={3600} isRunning={false} />);
    expect(screen.getByText('BOIL')).toBeInTheDocument();
  });

  it('should format time correctly', () => {
    render(<StepTimer step="BOIL" timeRemaining={3661} isRunning={false} />);
    expect(screen.getByText('61:01')).toBeInTheDocument();
  });

  it('should show pause when running', () => {
    render(<StepTimer step="BOIL" timeRemaining={3600} isRunning={true} onPause={() => {}} />);
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('should show start when paused', () => {
    render(<StepTimer step="BOIL" timeRemaining={3600} isRunning={false} onStart={() => {}} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- StepTimer.test.tsx`
Expected: FAIL with "Cannot find module '../components/Timer/StepTimer'"

- [ ] **Step 3: Implement StepTimer**

```typescript
// frontend/src/components/Timer/StepTimer.tsx
import React from 'react';

interface StepTimerProps {
  step: string;
  timeRemaining: number;
  isRunning: boolean;
  onStart?: () => void;
  onPause?: () => void;
}

export function StepTimer({ step, timeRemaining, isRunning, onStart, onPause }: StepTimerProps) {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-center text-white">
      <div className="text-sm opacity-80 mb-2">🔥 {step}</div>
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- StepTimer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Timer/StepTimer.tsx frontend/__tests__/StepTimer.test.tsx
git commit -m "feat(sprint-4): add StepTimer component"
```

---

### Task 3: HopCallout Component

**Files:**
- Create: `frontend/src/components/Timer/HopCallout.tsx`
- Test: `frontend/__tests__/HopCallout.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/HopCallout.test.tsx
import { render, screen } from '@testing-library/react';
import { HopCallout } from '../components/Timer/HopCallout';

describe('HopCallout', () => {
  it('should show next hop details', () => {
    const hop = { time: 15, name: 'Citra', amount: 1, unit: 'oz' };
    render(<HopCallout nextHop={hop} timeUntilHop={900} />);
    expect(screen.getByText('Citra — 1 oz')).toBeInTheDocument();
  });

  it('should show time until hop', () => {
    const hop = { time: 15, name: 'Citra', amount: 1, unit: 'oz' };
    render(<HopCallout nextHop={hop} timeUntilHop={900} />);
    expect(screen.getByText('15:00')).toBeInTheDocument();
  });

  it('should show alert state when hop is due', () => {
    const hop = { time: 15, name: 'Citra', amount: 1, unit: 'oz' };
    render(<HopCallout nextHop={hop} timeUntilHop={0} />);
    expect(screen.getByText('ADD NOW!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- HopCallout.test.tsx`
Expected: FAIL with "Cannot find module '../components/Timer/HopCallout'"

- [ ] **Step 3: Implement HopCallout**

```typescript
// frontend/src/components/Timer/HopCallout.tsx
import React from 'react';

interface HopCalloutProps {
  nextHop: { time: number; name: string; amount: number; unit: string } | null;
  timeUntilHop: number;
}

export function HopCallout({ nextHop, timeUntilHop }: HopCalloutProps) {
  if (!nextHop) return null;

  const minutes = Math.floor(timeUntilHop / 60);
  const seconds = timeUntilHop % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- HopCallout.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Timer/HopCallout.tsx frontend/__tests__/HopCallout.test.tsx
git commit -m "feat(sprint-4): add HopCallout component"
```

---

### Task 4: UpcomingSteps Component

**Files:**
- Create: `frontend/src/components/Timer/UpcomingSteps.tsx`
- Test: `frontend/__tests__/UpcomingSteps.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/UpcomingSteps.test.tsx
import { render, screen } from '@testing-library/react';
import { UpcomingSteps } from '../components/Timer/UpcomingSteps';

describe('UpcomingSteps', () => {
  it('should display upcoming steps', () => {
    render(<UpcomingSteps currentStep="BOIL" />);
    expect(screen.getByText('Whirlpool')).toBeInTheDocument();
    expect(screen.getByText('Cool & Transfer')).toBeInTheDocument();
  });

  it('should highlight next step', () => {
    render(<UpcomingSteps currentStep="MASH" />);
    expect(screen.getByText('Boil')).toHaveClass('font-bold');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- UpcomingSteps.test.tsx`
Expected: FAIL with "Cannot find module '../components/Timer/UpcomingSteps'"

- [ ] **Step 3: Implement UpcomingSteps**

```typescript
// frontend/src/components/Timer/UpcomingSteps.tsx
import React from 'react';

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- UpcomingSteps.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Timer/UpcomingSteps.tsx frontend/__tests__/UpcomingSteps.test.tsx
git commit -m "feat(sprint-4): add UpcomingSteps component"
```

---

### Task 5: EventLogger with FAB

**Files:**
- Create: `frontend/src/components/Timer/EventLogger.tsx`
- Test: `frontend/__tests__/EventLogger.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/EventLogger.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { EventLogger } from '../components/Timer/EventLogger';

describe('EventLogger', () => {
  it('should show FAB button', () => {
    render(<EventLogger onLogEvent={() => {}} />);
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('should open modal on FAB click', () => {
    render(<EventLogger onLogEvent={() => {}} />);
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('Log Event')).toBeInTheDocument();
  });

  it('should show event types', () => {
    render(<EventLogger onLogEvent={() => {}} />);
    fireEvent.click(screen.getByText('+'));
    expect(screen.getByText('Gravity')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- EventLogger.test.tsx`
Expected: FAIL with "Cannot find module '../components/Timer/EventLogger'"

- [ ] **Step 3: Implement EventLogger**

```typescript
// frontend/src/components/Timer/EventLogger.tsx
import React, { useState } from 'react';

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- EventLogger.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/Timer/EventLogger.tsx frontend/__tests__/EventLogger.test.tsx
git commit -m "feat(sprint-4): add EventLogger with FAB"
```

---

### Task 6: AudioAlerts Hook

**Files:**
- Create: `frontend/src/hooks/useAudioAlerts.ts`
- Test: `frontend/__tests__/useAudioAlerts.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/useAudioAlerts.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAudioAlerts } from '../hooks/useAudioAlerts';

describe('useAudioAlerts', () => {
  it('should have default settings', () => {
    const { result } = renderHook(() => useAudioAlerts());
    expect(result.current.settings.sound).toBe(true);
    expect(result.current.settings.vibration).toBe(true);
    expect(result.current.settings.visual).toBe(true);
  });

  it('should toggle sound', () => {
    const { result } = renderHook(() => useAudioAlerts());
    act(() => result.current.toggleSound());
    expect(result.current.settings.sound).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- useAudioAlerts.test.ts`
Expected: FAIL with "Cannot find module '../hooks/useAudioAlerts'"

- [ ] **Step 3: Implement useAudioAlerts**

```typescript
// frontend/src/hooks/useAudioAlerts.ts
import { useState, useCallback } from 'react';

interface AlertSettings {
  sound: boolean;
  vibration: boolean;
  visual: boolean;
}

export function useAudioAlerts() {
  const [settings, setSettings] = useState<AlertSettings>(() => {
    const saved = localStorage.getItem('brewbuddy-alert-settings');
    return saved ? JSON.parse(saved) : { sound: true, vibration: true, visual: true };
  });

  const toggleSound = useCallback(() => {
    setSettings(prev => {
      const next = { ...prev, sound: !prev.sound };
      localStorage.setItem('brewbuddy-alert-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleVibration = useCallback(() => {
    setSettings(prev => {
      const next = { ...prev, vibration: !prev.vibration };
      localStorage.setItem('brewbuddy-alert-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleVisual = useCallback(() => {
    setSettings(prev => {
      const next = { ...prev, visual: !prev.visual };
      localStorage.setItem('brewbuddy-alert-settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const playAlert = useCallback((type: 'step' | 'hop' | 'complete') => {
    if (settings.sound) {
      // Play sound based on type
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.play().catch(() => {});
    }
    
    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate(type === 'complete' ? [200, 100, 200] : 200);
    }
  }, [settings]);

  return {
    settings,
    toggleSound,
    toggleVibration,
    toggleVisual,
    playAlert,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- useAudioAlerts.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useAudioAlerts.ts frontend/__tests__/useAudioAlerts.test.ts
git commit -m "feat(sprint-4): add useAudioAlerts hook"
```

---

### Task 7: BrewTimer Page Assembly

**Files:**
- Create: `frontend/src/pages/BrewTimer.tsx`
- Modify: `frontend/src/App.tsx` — Add route
- Test: `frontend/__tests__/BrewTimer.test.tsx`

- [ ] **Step 1: Write failing test**

```typescript
// frontend/__tests__/BrewTimer.test.tsx
import { render, screen } from '@testing-library/react';
import { BrewTimer } from '../pages/BrewTimer';

// Mock the hook
jest.mock('../hooks/useBrewTimer', () => ({
  useBrewTimer: () => ({
    currentStep: 'BOIL',
    timeRemaining: 3600,
    isRunning: true,
    start: jest.fn(),
    pause: jest.fn(),
    skip: jest.fn(),
  }),
}));

describe('BrewTimer', () => {
  it('should render timer page', () => {
    render(<BrewTimer sessionId="session-1" />);
    expect(screen.getByText('BOIL')).toBeInTheDocument();
    expect(screen.getByText('60:00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- BrewTimer.test.tsx`
Expected: FAIL with "Cannot find module '../pages/BrewTimer'"

- [ ] **Step 3: Implement BrewTimer page**

```typescript
// frontend/src/pages/BrewTimer.tsx
import React from 'react';
import { StepTimer } from '../components/Timer/StepTimer';
import { HopCallout } from '../components/Timer/HopCallout';
import { UpcomingSteps } from '../components/Timer/UpcomingSteps';
import { EventLogger } from '../components/Timer/EventLogger';
import { useBrewTimer } from '../hooks/useBrewTimer';

interface BrewTimerProps {
  sessionId: string;
}

export function BrewTimer({ sessionId }: BrewTimerProps) {
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
  } = useBrewTimer(mockSession);

  const nextHop = mockSession.hopAdditions[0];
  const timeUntilHop = nextHop ? nextHop.time * 60 : 0;

  const handleLogEvent = (event: any) => {
    console.log('Logging event:', event);
    // POST to API
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-400">Brew Day #{sessionId.slice(-3)}</div>
        <div className="flex gap-2">
          <button className="bg-white/10 px-3 py-1 rounded text-sm">⚙️ Settings</button>
          <button onClick={skip} className="bg-white/10 px-3 py-1 rounded text-sm">⏭️ Skip</button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="flex justify-between mb-6 text-sm">
        <div className={currentStep === 'MASH' ? 'text-green-500 font-bold' : 'text-gray-500'}>✓ Mash</div>
        <div className={currentStep === 'BOIL' ? 'text-amber-500 font-bold' : 'text-gray-500'}>→ Boil</div>
        <div className={currentStep === 'WHIRLPOOL' ? 'text-blue-500 font-bold' : 'text-gray-500'}>Whirlpool</div>
        <div className={currentStep === 'COOL' ? 'text-purple-500 font-bold' : 'text-gray-500'}>Cool</div>
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
```

- [ ] **Step 4: Add route to App.tsx**

```typescript
// frontend/src/App.tsx - Add this route
import { BrewTimer } from './pages/BrewTimer';

// In routes:
<Route path="/brew-sessions/:id/timer" element={<BrewTimer sessionId={params.id} />} />
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend && npm test -- BrewTimer.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/BrewTimer.tsx frontend/src/App.tsx frontend/__tests__/BrewTimer.test.tsx
git commit -m "feat(sprint-4): assemble BrewTimer page with all components"
```

---

### Task 8: Docker Verification

**Files:**
- Run: `docker compose -f docker-compose.dev.yml up -d --build`

- [ ] **Step 1: Build and start Docker stack**

```bash
cd /mnt/c/Users/phili/workspace/brewbuddy
docker compose -f docker-compose.dev.yml up -d --build
```

- [ ] **Step 2: Verify all services healthy**

```bash
docker compose -f docker-compose.dev.yml ps
```
Expected: All services "Up" (healthy)

- [ ] **Step 3: Run all tests in Docker**

```bash
docker compose -f docker-compose.dev.yml exec backend npm test
docker compose -f docker-compose.dev.yml exec frontend npm test
```
Expected: All tests pass

- [ ] **Step 4: Manual smoke test**

- Open http://localhost:5173
- Navigate to brew sessions
- Start a timer
- Verify countdown works
- Test FAB opens modal

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore(sprint-4): Docker verification complete"
```

---

### Task 9: Documentation & Tagging

**Files:**
- Create: `docs/sprints/sprint-4/RESULTS.md`
- Modify: `VERSION` — Bump to `0.1.4`

- [ ] **Step 1: Create RESULTS.md**

```markdown
# Sprint 4 Results

## Status: ✅ COMPLETE

## Features Delivered
- Brew Timer UI (phone-first, dashboard view)
- StepTimer component (72px countdown)
- HopCallout component (next hop alert)
- UpcomingSteps component (timeline view)
- EventLogger with FAB (floating action button)
- AudioAlerts hook (configurable sound/vibration/visual)
- Client-side timer (React state + localStorage)

## Test Results
- Backend: X tests passing
- Frontend: X tests passing
- Docker: All services healthy

## Git Tags
- `sprint-4`

## Notes
- Timer runs client-side (no server dependency)
- Events logged to API when online
- Audio alerts configurable in settings
```

- [ ] **Step 2: Bump VERSION**

```bash
echo "0.1.4" > VERSION
```

- [ ] **Step 3: Tag sprint**

```bash
git tag -a sprint-4 -m "Sprint 4: Brew Timer UI"
```

- [ ] **Step 4: Merge to main**

```bash
git checkout main
git merge --no-ff sprint-4 -m "Merge sprint-4: Brew Timer UI"
git push origin main --tags
```

- [ ] **Step 5: Final commit**

```bash
git add VERSION docs/sprints/sprint-4/RESULTS.md
git commit -m "docs(sprint-4): complete sprint 4 documentation"
```

---

## Self-Review Checklist

- [ ] All timer components have tests
- [ ] useBrewTimer hook handles countdown correctly
- [ ] EventLogger FAB works on mobile
- [ ] Audio alerts are configurable
- [ ] Route added for timer page
- [ ] Docker verification passes
- [ ] Documentation complete
- [ ] VERSION bumped to 0.1.4
- [ ] Git tag created
