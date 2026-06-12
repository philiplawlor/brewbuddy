import { renderHook, act } from '@testing-library/react';
import { useAudioAlerts } from '../src/hooks/useAudioAlerts';

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

  it('should return visual setting from playAlert', () => {
    const { result } = renderHook(() => useAudioAlerts());
    expect(result.current.playAlert('step')).toBe(true);
    act(() => result.current.toggleVisual());
    expect(result.current.playAlert('step')).toBe(false);
  });
});
