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
