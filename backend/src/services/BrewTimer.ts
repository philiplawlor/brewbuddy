/**
 * Brew Timer Engine
 * Manages brew day step progression, countdown timers, and event generation.
 */

export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export type BrewStepType =
  | 'mash'
  | 'boil'
  | 'whirlpool'
  | 'cool'
  | 'transfer';

export interface BrewStep {
  type: BrewStepType;
  name: string;
  durationMinutes: number;
  remainingSeconds: number;
  hopAdditions?: HopAddition[];
}

export interface HopAddition {
  name: string;
  weight: number;
  weightUnit: 'g' | 'oz' | 'lb';
  alphaAcid: number;
  boilMinutes: number;
  added: boolean;
}

export interface TimerEvent {
  type: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface BrewTimerConfig {
  mashMinutes?: number;
  boilMinutes?: number;
  whirlpoolMinutes?: number;
  hopAdditions?: Array<{
    name: string;
    weight: number;
    weightUnit: 'g' | 'oz' | 'lb';
    alphaAcid: number;
    boilMinutes: number;
  }>;
}

const DEFAULT_STEPS: BrewStep[] = [
  { type: 'mash', name: 'Mash', durationMinutes: 60, remainingSeconds: 60 * 60 },
  { type: 'boil', name: 'Boil', durationMinutes: 60, remainingSeconds: 60 * 60 },
  { type: 'whirlpool', name: 'Whirlpool', durationMinutes: 15, remainingSeconds: 15 * 60 },
  { type: 'cool', name: 'Cool & Transfer', durationMinutes: 0, remainingSeconds: 0 },
];

export class BrewTimer {
  private _state: TimerState = 'idle';
  private _currentStepIndex: number = 0;
  private _steps: BrewStep[];
  private _events: TimerEvent[] = [];
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _onTick: ((remainingSeconds: number) => void) | null = null;
  private _onStepChange: ((step: BrewStep, index: number) => void) | null = null;
  private _onComplete: (() => void) | null = null;
  private _onHopAddition: ((hop: HopAddition) => void) | null = null;

  constructor(config: BrewTimerConfig = {}) {
    this._steps = this._buildSteps(config);
  }

  private _buildSteps(config: BrewTimerConfig): BrewStep[] {
    const mashMinutes = config.mashMinutes ?? 60;
    const boilMinutes = config.boilMinutes ?? 60;
    const whirlpoolMinutes = config.whirlpoolMinutes ?? 15;

    const hopAdditions = (config.hopAdditions ?? [])
      .map((h) => ({
        ...h,
        added: false,
      }))
      .sort((a, b) => b.boilMinutes - a.boilMinutes);

    return [
      {
        type: 'mash',
        name: 'Mash',
        durationMinutes: mashMinutes,
        remainingSeconds: mashMinutes * 60,
      },
      {
        type: 'boil',
        name: 'Boil',
        durationMinutes: boilMinutes,
        remainingSeconds: boilMinutes * 60,
        hopAdditions,
      },
      {
        type: 'whirlpool',
        name: 'Whirlpool',
        durationMinutes: whirlpoolMinutes,
        remainingSeconds: whirlpoolMinutes * 60,
      },
      {
        type: 'cool',
        name: 'Cool & Transfer',
        durationMinutes: 0,
        remainingSeconds: 0,
      },
    ];
  }

  get state(): TimerState {
    return this._state;
  }

  get currentStep(): BrewStep {
    return this._steps[this._currentStepIndex];
  }

  get currentStepIndex(): number {
    return this._currentStepIndex;
  }

  get steps(): readonly BrewStep[] {
    return this._steps;
  }

  get events(): readonly TimerEvent[] {
    return this._events;
  }

  get totalSteps(): number {
    return this._steps.length;
  }

  get isComplete(): boolean {
    return this._state === 'completed';
  }

  // Event callbacks
  onTick(callback: (remainingSeconds: number) => void): void {
    this._onTick = callback;
  }

  onStepChange(callback: (step: BrewStep, index: number) => void): void {
    this._onStepChange = callback;
  }

  onComplete(callback: () => void): void {
    this._onComplete = callback;
  }

  onHopAddition(callback: (hop: HopAddition) => void): void {
    this._onHopAddition = callback;
  }

  start(): void {
    if (this._state === 'completed') return;

    if (this._state === 'idle') {
      this._logEvent('timer_start', { step: this.currentStep.name });
    }

    this._state = 'running';

    // Handle zero-duration steps immediately
    while (
      this._state === 'running' &&
      this._currentStepIndex < this._steps.length &&
      this._steps[this._currentStepIndex].durationMinutes === 0
    ) {
      this._advanceStep();
    }

    // Only start interval if there's a step with actual duration
    if (
      this._state === 'running' &&
      this._currentStepIndex < this._steps.length &&
      this._steps[this._currentStepIndex].durationMinutes > 0
    ) {
      this._startInterval();
    }
  }

  pause(): void {
    if (this._state !== 'running') return;
    this._state = 'paused';
    this._stopInterval();
    this._logEvent('timer_pause', { step: this.currentStep.name });
  }

  resume(): void {
    if (this._state !== 'paused') return;
    this._state = 'running';
    this._startInterval();
    this._logEvent('timer_resume', { step: this.currentStep.name });
  }

  /**
   * Confirm current step is complete and advance to next.
   * Only works for steps with duration (not cool/transfer).
   */
  confirmStepComplete(): void {
    if (this._state === 'idle' || this._state === 'completed') return;

    this._stopInterval();
    this._logEvent(`${this.currentStep.type}_complete`, {
      step: this.currentStep.name,
    });

    this._advanceStep();
  }

  /**
   * Skip to next step without waiting for timer.
   */
  skipStep(): void {
    if (this._state === 'idle' || this._state === 'completed') return;

    this._stopInterval();
    this._logEvent(`${this.currentStep.type}_skipped`, {
      step: this.currentStep.name,
      remainingSeconds: this.currentStep.remainingSeconds,
    });

    this._advanceStep();
  }

  /**
   * Go back to previous step.
   */
  previousStep(): void {
    if (this._currentStepIndex === 0) return;
    if (this._state === 'completed') return;

    this._stopInterval();
    this._currentStepIndex--;
    const step = this.currentStep;
    step.remainingSeconds = step.durationMinutes * 60;

    this._logEvent('step_back', { step: step.name });
    if (this._onStepChange) this._onStepChange(step, this._currentStepIndex);

    if (this._state === 'running') {
      this._startInterval();
    }
  }

  /**
   * Manually set remaining seconds for current step.
   */
  setRemainingSeconds(seconds: number): void {
    this.currentStep.remainingSeconds = Math.max(0, seconds);
  }

  /**
   * Get formatted time string (MM:SS or HH:MM:SS).
   */
  getFormattedTime(stepIndex?: number): string {
    const step = stepIndex !== undefined ? this._steps[stepIndex] : this.currentStep;
    const totalSeconds = step.remainingSeconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get progress percentage for current step (0-100).
   */
  getStepProgress(): number {
    const step = this.currentStep;
    if (step.durationMinutes === 0) return 100;
    const totalSeconds = step.durationMinutes * 60;
    const elapsed = totalSeconds - step.remainingSeconds;
    return Math.min(100, Math.round((elapsed / totalSeconds) * 100));
  }

  /**
   * Get overall progress across all steps (0-100).
   */
  getOverallProgress(): number {
    const totalDuration = this._steps.reduce(
      (sum, step) => sum + step.durationMinutes * 60,
      0
    );
    if (totalDuration === 0) return 100;

    let elapsed = 0;
    for (let i = 0; i < this._currentStepIndex; i++) {
      elapsed += this._steps[i].durationMinutes * 60;
    }
    elapsed += this.currentStep.durationMinutes * 60 - this.currentStep.remainingSeconds;

    return Math.min(100, Math.round((elapsed / totalDuration) * 100));
  }

  /**
   * Reset timer to initial state.
   */
  reset(): void {
    this._stopInterval();
    this._state = 'idle';
    this._currentStepIndex = 0;
    this._events = [];
    this._steps = this._buildSteps({
      mashMinutes: this._steps[0].durationMinutes,
      boilMinutes: this._steps[1].durationMinutes,
      whirlpoolMinutes: this._steps[2].durationMinutes,
      hopAdditions: this._steps[1].hopAdditions?.map((h) => ({
        name: h.name,
        weight: h.weight,
        weightUnit: h.weightUnit,
        alphaAcid: h.alphaAcid,
        boilMinutes: h.boilMinutes,
      })),
    });
  }

  /**
   * Destroy timer and clean up interval.
   */
  destroy(): void {
    this._stopInterval();
    this._onTick = null;
    this._onStepChange = null;
    this._onComplete = null;
    this._onHopAddition = null;
  }

  // Private methods

  private _startInterval(): void {
    this._stopInterval();
    this._intervalId = setInterval(() => {
      if (this._state !== 'running') return;

      const step = this.currentStep;

      // Cool/transfer step has no timer — skip
      if (step.durationMinutes === 0) {
        this._stopInterval();
        this._advanceStep();
        return;
      }

      step.remainingSeconds--;

      // Check for hop additions during boil
      if (step.type === 'boil' && step.hopAdditions) {
        const boilMinutesElapsed =
          step.durationMinutes - Math.ceil(step.remainingSeconds / 60);
        for (const hop of step.hopAdditions) {
          // Add hop when elapsed time reaches (duration - boilMinutes)
          // e.g., 60-min hop added at boilMinutesElapsed = 0 (start of boil)
          if (!hop.added && boilMinutesElapsed >= (step.durationMinutes - hop.boilMinutes)) {
            hop.added = true;
            this._logEvent('hop_addition', {
              hopName: hop.name,
              weight: hop.weight,
              weightUnit: hop.weightUnit,
              alphaAcid: hop.alphaAcid,
              boilMinutes: hop.boilMinutes,
            });
            if (this._onHopAddition) this._onHopAddition(hop);
          }
        }
      }

      if (this._onTick) this._onTick(step.remainingSeconds);

      // Step complete
      if (step.remainingSeconds <= 0) {
        this._stopInterval();
        this._logEvent(`${step.type}_complete`, { step: step.name });
        this._advanceStep();
      }
    }, 1000);
  }

  private _stopInterval(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  private _advanceStep(): void {
    // Mark step as complete
    this.currentStep.remainingSeconds = 0;

    // Find next step with duration > 0
    let nextIndex = this._currentStepIndex + 1;
    while (
      nextIndex < this._steps.length &&
      this._steps[nextIndex].durationMinutes === 0
    ) {
      nextIndex++;
    }

    if (nextIndex >= this._steps.length) {
      // All steps complete
      this._state = 'completed';
      this._logEvent('timer_complete', {});
      if (this._onComplete) this._onComplete();
      return;
    }

    this._currentStepIndex = nextIndex;
    const nextStep = this.currentStep;

    this._logEvent('step_start', { step: nextStep.name });
    if (this._onStepChange) this._onStepChange(nextStep, this._currentStepIndex);

    // Auto-start next step if timer was running
    if (this._state === 'running') {
      this._startInterval();
    }
  }

  private _logEvent(type: string, details?: Record<string, any>): void {
    this._events.push({
      type,
      timestamp: new Date(),
      details,
    });
  }
}
