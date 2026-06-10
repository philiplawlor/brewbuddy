import { Document, Types } from 'mongoose';

export type BrewSessionStatus =
  | 'planned'
  | 'in_progress'
  | 'fermenting'
  | 'conditioning'
  | 'bottled'
  | 'consumed';

export type BrewMethod = 'all_grain' | 'partial_mash' | 'extract' | 'biab';

export type SessionEventType =
  | 'mash_in'
  | 'mash_step'
  | 'mash_out'
  | 'vorlauf'
  | 'sparge'
  | 'boil_start'
  | 'hop_addition'
  | 'whirlpool'
  | 'flameout'
  | 'chill'
  | 'pitch_yeast'
  | 'transfer';

export interface IBrewSession {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  recipeVersionId?: Types.ObjectId;
  batchNumber?: string;
  sessionName?: string;
  brewDate: Date;
  status: BrewSessionStatus;

  // Batch Info
  batchSize?: number;
  batchSizeUnit?: 'L' | 'gal' | 'bbl';
  method?: BrewMethod;

  // Actual Results
  actualOg?: number;
  actualFg?: number;
  actualAbv?: number;
  actualIbu?: number;
  actualSrm?: number;

  // Timing
  brewDurationMinutes?: number;
  fermentationDays?: number;
  conditioningDays?: number;

  // Environment
  ambientTemperature?: number;
  humidity?: number;

  // Cost
  totalCost?: number;
  costPerLiter?: number;

  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISessionEvent {
  sessionId: Types.ObjectId;
  eventType: SessionEventType;
  timestamp: Date;
  temperature?: number;
  gravityReading?: number;
  notes?: string;
  durationMinutes?: number;

  // Hop Addition Specific
  hopName?: string;
  hopWeight?: number;
  hopWeightUnit?: 'g' | 'oz' | 'lb';
  hopAlphaAcid?: number;
  hopBoilMinutes?: number;

  // Mash Step Specific
  mashStepName?: string;
  targetTemp?: number;
  actualTemp?: number;

  createdAt?: Date;
}

export type BrewSessionDocument = IBrewSession & Document;
export type SessionEventDocument = ISessionEvent & Document;
