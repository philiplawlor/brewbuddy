import { renderHook, act } from '@testing-library/react';
import { useBrewTimer } from '../src/hooks/useBrewTimer';

describe('useBrewTimer', () => {
  const mockSession = {
    _id: 'session-1',
    userId: 'user-1',
    recipeId: { _id: 'recipe-1', recipeName: 'Test IPA' },
    brewDate: '2026-01-01',
    status: 'in_progress' as const,
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

  it('should skip to next step', () => {
    const { result } = renderHook(() => useBrewTimer(mockSession));
    expect(result.current.currentStep).toBe('MASH');
    act(() => result.current.skip());
    expect(result.current.currentStep).toBe('BOIL');
    expect(result.current.timeRemaining).toBe(60 * 60);
    expect(result.current.isRunning).toBe(false);
  });

  it('should auto-pause when timeRemaining reaches 0', async () => {
    vi.useFakeTimers();
    const shortSession = { ...mockSession };
    const { result } = renderHook(() => useBrewTimer(shortSession));

    // Skip through steps until we reach COOL (0 duration)
    act(() => result.current.skip()); // MASH -> BOIL
    act(() => result.current.skip()); // BOIL -> WHIRLPOOL
    act(() => result.current.skip()); // WHIRLPOOL -> COOL

    expect(result.current.currentStep).toBe('COOL');
    expect(result.current.timeRemaining).toBe(0);

    // Starting a 0-duration step should not run
    act(() => result.current.start());
    expect(result.current.isRunning).toBe(true);

    // Timer should auto-pause immediately since timeRemaining is already 0
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.isRunning).toBe(false);

    vi.useRealTimers();
  });
});
