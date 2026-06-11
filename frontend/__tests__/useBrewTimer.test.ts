import { renderHook, act } from '@testing-library/react';
import { useBrewTimer } from '../src/hooks/useBrewTimer';

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
    vi.useFakeTimers();
    const { result } = renderHook(() => useBrewTimer(mockSession));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timeRemaining).toBe(60 * 60 - 1);
    vi.useRealTimers();
  });
});
