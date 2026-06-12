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

  const playAlert = useCallback((type: 'step' | 'hop' | 'complete'): boolean => {
    if (settings.sound) {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.play().catch(() => {});
    }

    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate(type === 'complete' ? [200, 100, 200] : 200);
    }

    return settings.visual;
  }, [settings]);

  return {
    settings,
    toggleSound,
    toggleVibration,
    toggleVisual,
    playAlert,
  };
}
