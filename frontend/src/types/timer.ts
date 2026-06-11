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
