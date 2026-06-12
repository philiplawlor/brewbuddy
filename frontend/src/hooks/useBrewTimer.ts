import { useState, useRef, useEffect, useCallback } from 'react';
import { TimerState } from '../types/timer';
import { BrewSession } from '../types';

const STEP_DURATIONS = {
  MASH: 60 * 60, // 60 minutes
  BOIL: 60 * 60, // 60 minutes
  WHIRLPOOL: 15 * 60, // 15 minutes
  COOL: 0, // manual step
};

const STEP_ORDER = ['MASH', 'BOIL', 'WHIRLPOOL', 'COOL'] as const;

export function useBrewTimer(session: BrewSession) {
  const [state, setState] = useState<TimerState>({
    currentStep: 'MASH',
    timeRemaining: STEP_DURATIONS.MASH,
    isRunning: false,
    hopAdditions: (session as any).hopAdditions || [],
    events: [],
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        setState(prev => {
          const next = prev.timeRemaining - 1;
          if (next <= 0) {
            return { ...prev, timeRemaining: 0, isRunning: false };
          }
          return { ...prev, timeRemaining: next };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  return {
    ...state,
    start,
    pause,
    skip,
  };
}
