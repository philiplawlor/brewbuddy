import { BrewTimer, BrewTimerConfig } from '../src/services/BrewTimer';

describe('BrewTimer', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const timer = new BrewTimer();

      expect(timer.state).toBe('idle');
      expect(timer.totalSteps).toBe(4);
      expect(timer.currentStepIndex).toBe(0);
      expect(timer.currentStep.type).toBe('mash');
      expect(timer.isComplete).toBe(false);
    });

    it('should initialize with custom config', () => {
      const timer = new BrewTimer({
        mashMinutes: 90,
        boilMinutes: 90,
        whirlpoolMinutes: 20,
      });

      expect(timer.steps[0].durationMinutes).toBe(90);
      expect(timer.steps[1].durationMinutes).toBe(90);
      expect(timer.steps[2].durationMinutes).toBe(20);
    });

    it('should set up hop additions sorted by boil minutes descending', () => {
      const timer = new BrewTimer({
        hopAdditions: [
          { name: 'Citra', weight: 28, weightUnit: 'g', alphaAcid: 12.5, boilMinutes: 5 },
          { name: 'Cascade', weight: 14, weightUnit: 'g', alphaAcid: 5.5, boilMinutes: 60 },
          { name: 'Centennial', weight: 14, weightUnit: 'g', alphaAcid: 10, boilMinutes: 30 },
        ],
      });

      const boilStep = timer.steps[1];
      expect(boilStep.hopAdditions).toHaveLength(3);
      expect(boilStep.hopAdditions![0].name).toBe('Cascade');
      expect(boilStep.hopAdditions![0].boilMinutes).toBe(60);
      expect(boilStep.hopAdditions![1].name).toBe('Centennial');
      expect(boilStep.hopAdditions![1].boilMinutes).toBe(30);
      expect(boilStep.hopAdditions![2].name).toBe('Citra');
      expect(boilStep.hopAdditions![2].boilMinutes).toBe(5);
    });

    it('should mark all hop additions as not added initially', () => {
      const timer = new BrewTimer({
        hopAdditions: [
          { name: 'Cascade', weight: 14, weightUnit: 'g', alphaAcid: 5.5, boilMinutes: 60 },
        ],
      });

      const hops = timer.steps[1].hopAdditions!;
      expect(hops[0].added).toBe(false);
    });
  });

  describe('State Transitions', () => {
    it('should start from idle', () => {
      const timer = new BrewTimer();
      timer.start();

      expect(timer.state).toBe('running');
      timer.destroy();
    });

    it('should pause from running', () => {
      const timer = new BrewTimer();
      timer.start();
      timer.pause();

      expect(timer.state).toBe('paused');
      timer.destroy();
    });

    it('should resume from paused', () => {
      const timer = new BrewTimer();
      timer.start();
      timer.pause();
      timer.resume();

      expect(timer.state).toBe('running');
      timer.destroy();
    });

    it('should not start if completed', () => {
      const timer = new BrewTimer({ mashMinutes: 0, boilMinutes: 0, whirlpoolMinutes: 0 });
      // All steps with 0 duration skip to completed
      timer.start();

      // With 0 duration steps, it completes immediately on advance
      expect(timer.state).toBe('completed');
      timer.destroy();
    });

    it('should not pause if idle', () => {
      const timer = new BrewTimer();
      timer.pause();

      expect(timer.state).toBe('idle');
      timer.destroy();
    });

    it('should not resume if not paused', () => {
      const timer = new BrewTimer();
      timer.resume();

      expect(timer.state).toBe('idle');
      timer.destroy();
    });
  });

  describe('Timer Countdown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should decrement remaining seconds on tick', () => {
      const timer = new BrewTimer({ mashMinutes: 60 });
      timer.start();

      expect(timer.currentStep.remainingSeconds).toBe(60 * 60);

      jest.advanceTimersByTime(3000); // 3 seconds
      expect(timer.currentStep.remainingSeconds).toBe(60 * 60 - 3);

      timer.destroy();
    });

    it('should call onTick callback', () => {
      const tickFn = jest.fn();
      const timer = new BrewTimer({ mashMinutes: 60 });
      timer.onTick(tickFn);
      timer.start();

      jest.advanceTimersByTime(1000);
      expect(tickFn).toHaveBeenCalledWith(60 * 60 - 1);

      timer.destroy();
    });

    it('should auto-advance to next step when timer reaches 0', () => {
      const stepChangeFn = jest.fn();
      const timer = new BrewTimer({ mashMinutes: 1, boilMinutes: 60 });
      timer.onStepChange(stepChangeFn);
      timer.start();

      // Fast forward through mash
      jest.advanceTimersByTime(60 * 1000);

      expect(timer.currentStepIndex).toBe(1);
      expect(timer.currentStep.type).toBe('boil');
      expect(stepChangeFn).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'boil' }),
        1
      );

      timer.destroy();
    });

    it('should mark step remainingSeconds to 0 on completion', () => {
      const timer = new BrewTimer({ mashMinutes: 1 });
      timer.start();

      jest.advanceTimersByTime(60 * 1000);
      expect(timer.steps[0].remainingSeconds).toBe(0);

      timer.destroy();
    });
  });

  describe('Hop Additions', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should trigger hop addition at correct boil time', () => {
      const hopFn = jest.fn();
      const timer = new BrewTimer({
        mashMinutes: 0,
        boilMinutes: 60,
        whirlpoolMinutes: 0,
        hopAdditions: [
          { name: 'Cascade', weight: 14, weightUnit: 'g', alphaAcid: 5.5, boilMinutes: 60 },
        ],
      });
      timer.onHopAddition(hopFn);
      timer.start();

      // Advance past mash (0 min) and into boil
      jest.advanceTimersByTime(1000); // 1 second into boil

      // Hop should be added at 0 seconds into boil (60 min remaining)
      expect(hopFn).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Cascade', added: true })
      );

      timer.destroy();
    });

    it('should not re-add same hop addition', () => {
      const hopFn = jest.fn();
      const timer = new BrewTimer({
        mashMinutes: 0,
        boilMinutes: 60,
        whirlpoolMinutes: 0,
        hopAdditions: [
          { name: 'Cascade', weight: 14, weightUnit: 'g', alphaAcid: 5.5, boilMinutes: 60 },
        ],
      });
      timer.onHopAddition(hopFn);
      timer.start();

      jest.advanceTimersByTime(3000); // 3 seconds
      expect(hopFn).toHaveBeenCalledTimes(1);

      timer.destroy();
    });

    it('should trigger hop additions at different times', () => {
      const hopFn = jest.fn();
      const timer = new BrewTimer({
        mashMinutes: 0,
        boilMinutes: 60,
        whirlpoolMinutes: 0,
        hopAdditions: [
          { name: 'Cascade', weight: 14, weightUnit: 'g', alphaAcid: 5.5, boilMinutes: 60 },
          { name: 'Citra', weight: 28, weightUnit: 'g', alphaAcid: 12.5, boilMinutes: 5 },
        ],
      });
      timer.onHopAddition(hopFn);
      timer.start();

      // First hop at start of boil
      jest.advanceTimersByTime(1000);
      expect(hopFn).toHaveBeenCalledTimes(1);
      expect(hopFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'Cascade' })
      );

      // Advance to 55 minutes into boil (5 minutes remaining)
      jest.advanceTimersByTime(55 * 60 * 1000);
      expect(hopFn).toHaveBeenCalledTimes(2);
      expect(hopFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'Citra' })
      );

      timer.destroy();
    });
  });

  describe('Pause / Resume', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should stop counting when paused', () => {
      const timer = new BrewTimer({ mashMinutes: 60 });
      timer.start();

      jest.advanceTimersByTime(5000);
      timer.pause();
      const remainingAtPause = timer.currentStep.remainingSeconds;

      jest.advanceTimersByTime(10000);
      expect(timer.currentStep.remainingSeconds).toBe(remainingAtPause);

      timer.destroy();
    });

    it('should resume counting after pause', () => {
      const timer = new BrewTimer({ mashMinutes: 60 });
      timer.start();

      jest.advanceTimersByTime(5000);
      timer.pause();
      timer.resume();

      jest.advanceTimersByTime(3000);
      expect(timer.currentStep.remainingSeconds).toBe(60 * 60 - 8);

      timer.destroy();
    });
  });

  describe('Step Navigation', () => {
    it('should skip to next step', () => {
      const stepChangeFn = jest.fn();
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60 });
      timer.onStepChange(stepChangeFn);
      timer.start();

      timer.skipStep();

      expect(timer.currentStepIndex).toBe(1);
      expect(timer.currentStep.type).toBe('boil');
      expect(stepChangeFn).toHaveBeenCalled();
      timer.destroy();
    });

    it('should go back to previous step', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60 });
      timer.start();

      timer.skipStep();
      expect(timer.currentStepIndex).toBe(1);

      timer.previousStep();
      expect(timer.currentStepIndex).toBe(0);
      expect(timer.currentStep.type).toBe('mash');
      timer.destroy();
    });

    it('should not go back before first step', () => {
      const timer = new BrewTimer({ mashMinutes: 60 });
      timer.start();

      timer.previousStep();
      expect(timer.currentStepIndex).toBe(0);
      timer.destroy();
    });

    it('should reset remaining seconds when going back', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60 });
      timer.start();

      timer.currentStep.remainingSeconds = 100;
      timer.skipStep();
      timer.previousStep();

      expect(timer.currentStep.remainingSeconds).toBe(60 * 60);
      timer.destroy();
    });

    it('should confirm step complete and advance', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60 });
      timer.start();

      timer.confirmStepComplete();

      expect(timer.currentStepIndex).toBe(1);
      expect(timer.currentStep.type).toBe('boil');
      timer.destroy();
    });
  });

  describe('Formatting', () => {
    it('should format time as HH:MM:SS for durations >= 60 minutes', () => {
      const timer = new BrewTimer({ mashMinutes: 60 });
      timer.start();

      expect(timer.getFormattedTime()).toBe('01:00:00');
      timer.destroy();
    });

    it('should format time as HH:MM:SS for long durations', () => {
      const timer = new BrewTimer({ mashMinutes: 120 });
      timer.start();

      expect(timer.getFormattedTime()).toBe('02:00:00');
      timer.destroy();
    });

    it('should format specific step time', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 90 });

      expect(timer.getFormattedTime(0)).toBe('01:00:00');
      expect(timer.getFormattedTime(1)).toBe('01:30:00');
      timer.destroy();
    });

    it('should format time with leading zeros', () => {
      const timer = new BrewTimer({ mashMinutes: 5 });
      timer.start();

      timer.currentStep.remainingSeconds = 65; // 1:05
      expect(timer.getFormattedTime()).toBe('01:05');
      timer.destroy();
    });
  });

  describe('Progress', () => {
    it('should calculate step progress', () => {
      const timer = new BrewTimer({ mashMinutes: 60 });
      timer.start();

      expect(timer.getStepProgress()).toBe(0);

      timer.currentStep.remainingSeconds = 30 * 60; // halfway
      expect(timer.getStepProgress()).toBe(50);

      timer.currentStep.remainingSeconds = 0;
      expect(timer.getStepProgress()).toBe(100);

      timer.destroy();
    });

    it('should return 100% for cool step', () => {
      const timer = new BrewTimer({ mashMinutes: 0, boilMinutes: 0, whirlpoolMinutes: 0 });

      // Cool step has 0 duration, so timer completes immediately
      expect(timer.getStepProgress()).toBe(100);
      timer.destroy();
    });

    it('should calculate overall progress', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60, whirlpoolMinutes: 0 });
      timer.start();

      expect(timer.getOverallProgress()).toBe(0);

      // After mash completes (skip to boil)
      timer.skipStep();
      // mash is complete (0), boil still at full duration
      expect(timer.getOverallProgress()).toBe(50);

      // Halfway through boil
      timer.currentStep.remainingSeconds = 30 * 60;
      expect(timer.getOverallProgress()).toBe(75);

      timer.destroy();
    });
  });

  describe('Events', () => {
    it('should log timer_start on start', () => {
      const timer = new BrewTimer();
      timer.start();

      expect(timer.events).toHaveLength(1);
      expect(timer.events[0].type).toBe('timer_start');
      timer.destroy();
    });

    it('should log timer_pause on pause', () => {
      const timer = new BrewTimer();
      timer.start();
      timer.pause();

      expect(timer.events).toHaveLength(2);
      expect(timer.events[1].type).toBe('timer_pause');
      timer.destroy();
    });

    it('should log step_complete on confirm', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60 });
      timer.start();
      timer.confirmStepComplete();

      const completeEvent = timer.events.find((e) => e.type === 'mash_complete');
      expect(completeEvent).toBeDefined();
      timer.destroy();
    });

    it('should log step_skipped on skip', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60 });
      timer.start();
      timer.skipStep();

      const skipEvent = timer.events.find((e) => e.type === 'mash_skipped');
      expect(skipEvent).toBeDefined();
      timer.destroy();
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      const timer = new BrewTimer({ mashMinutes: 60, boilMinutes: 60 });
      timer.start();
      timer.currentStep.remainingSeconds = 100;

      timer.reset();

      expect(timer.state).toBe('idle');
      expect(timer.currentStepIndex).toBe(0);
      expect(timer.currentStep.remainingSeconds).toBe(60 * 60);
      expect(timer.events).toHaveLength(0);
      timer.destroy();
    });
  });

  describe('Callbacks', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should call onComplete when all steps done', () => {
      const completeFn = jest.fn();
      const timer = new BrewTimer({
        mashMinutes: 0,
        boilMinutes: 0,
        whirlpoolMinutes: 0,
      });
      timer.onComplete(completeFn);
      timer.start();

      // All 0-duration steps should complete immediately
      expect(completeFn).toHaveBeenCalled();
      timer.destroy();
    });

    it('should call onStepChange when advancing', () => {
      const stepChangeFn = jest.fn();
      const timer = new BrewTimer({ mashMinutes: 1, boilMinutes: 60 });
      timer.onStepChange(stepChangeFn);
      timer.start();

      jest.advanceTimersByTime(60 * 1000);
      expect(stepChangeFn).toHaveBeenCalled();
      timer.destroy();
    });
  });

  describe('Destroy', () => {
    it('should clean up interval on destroy', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      const timer = new BrewTimer();
      timer.start();
      timer.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});
