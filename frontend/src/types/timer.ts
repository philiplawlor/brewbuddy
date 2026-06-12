import { SessionEvent } from './index';

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
