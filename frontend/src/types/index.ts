// User types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

// API types
export interface ApiError {
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Recipe types
export interface Recipe {
  _id: string;
  userId?: string;
  recipeName: string;
  style?: string;
  styleCode?: string;
  method?: 'all_grain' | 'partial_mash' | 'extract' | 'biab';
  batchSize?: number;
  batchSizeUnit?: 'L' | 'gal' | 'bbl';
  boilSize?: number;
  preBoilSize?: number;
  boilTimeMinutes?: number;
  efficiency?: number;
  estimatedOg?: number;
  estimatedFg?: number;
  estimatedAbv?: number;
  estimatedIbu?: number;
  estimatedSrm?: number;
  estimatedCalories?: number;
  notes?: string;
  tasteNotes?: string;
  tasteRating?: number;
  isPublic?: boolean;
  isArchived?: boolean;

  brewer?: string;
  asstBrewer?: string;
  brewDate?: string;

  carbonation?: number;
  forcedCarbonation?: boolean;
  primingSugarName?: string;
  primingSugarEquiv?: number;
  kegPrimingFactor?: number;
  carbonationTemp?: number;
  primaryAgeDays?: number;
  primaryTemp?: number;
  secondaryAgeDays?: number;
  secondaryTemp?: number;
  tertiaryAgeDays?: number;
  tertiaryTemp?: number;
  ageDays?: number;
  ageTemp?: number;

  styleProfile?: StyleProfile;
  equipment?: Equipment;
  instructions?: Instruction[];
  miscIngredients?: MiscIngredient[];

  mashProfile?: {
    name?: string;
    grainTemp?: number;
    tunTemp?: number;
    spargeTemp?: number;
    ph?: number;
    steps: Array<{
      name: string;
      type: string;
      infuseAmount?: number;
      stepTemp?: number;
      stepTime?: number;
      rampTime?: number;
      endTemp?: number;
    }>;
  };

  createdAt?: string;
  updatedAt?: string;
}

export interface StyleProfile {
  categoryNumber?: string;
  category?: string;
  styleLetter?: string;
  styleGuide?: string;
  name?: string;
  aroma?: string;
  appearance?: string;
  flavor?: string;
  mouthfeel?: string;
  overallImpression?: string;
  profile?: string;
  ingredients?: string;
  examples?: string;
  notes?: string;
  ogMin?: number;
  ogMax?: number;
  fgMin?: number;
  fgMax?: number;
  ibuMin?: number;
  ibuMax?: number;
  colorMin?: number;
  colorMax?: number;
  abvMin?: number;
  abvMax?: number;
  carbonationMin?: number;
  carbonationMax?: number;
}

export interface Equipment {
  name?: string;
  tunVolume?: number;
  tunWeight?: number;
  tunSpecificHeat?: number;
  mashTunVolume?: number;
  lauterTunVolume?: number;
  boilKettleVolume?: number;
  boilTime?: number;
  lauterDeadSpace?: number;
  topUpWater?: number;
  trubChillerLoss?: number;
  evapRate?: number;
  calculatedBoilSize?: number;
  calculatedBatchSize?: number;
  equipmentLoss?: number;
  whirlpoolTime?: number;
  whirlpoolTemp?: number;
}

export interface Instruction {
  name?: string;
  amount?: number;
  amountIsWeight?: boolean;
  time?: number;
  step?: number;
}

export interface MiscIngredient {
  name: string;
  type?: string;
  amount?: number;
  amountIsWeight?: boolean;
  useFor?: string;
  use?: string;
  time?: number;
  notes?: string;
}

export interface RecipeIngredient {
  _id: string;
  recipeId: string;
  ingredientType: 'grain' | 'hops' | 'yeast' | 'adjunct' | 'chemical';
  order?: number;
  name?: string;
  category?: string;
  grainWeight?: number;
  grainWeightUnit?: 'lb' | 'kg' | 'g' | 'oz';
  lovibond?: number;
  potentialExtract?: number;
  yieldPercent?: number;
  hopsWeight?: number;
  hopsWeightUnit?: 'g' | 'oz' | 'lb';
  hopAdditionTime?: string;
  hopAlphaAcid?: number;
  hopBoilMinutes?: number;
  hopForm?: 'pellet' | 'whole_leaf' | 'extract' | 'cryo';
  yeastPackageCount?: number;
  yeastStarterSizeMl?: number;
  yeastCellCount?: number;
  yeastType?: string;
  yeastForm?: string;
  strainId?: string;
  laboratory?: string;
}

export interface RecipeListResponse {
  recipes: Recipe[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Brew Session types
export type BrewSessionStatus =
  | 'planned'
  | 'in_progress'
  | 'fermenting'
  | 'conditioning'
  | 'bottled'
  | 'consumed';

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

export interface BrewSession {
  _id: string;
  userId: string;
  recipeId: Recipe | string;
  recipeVersionId?: string;
  batchNumber?: string;
  sessionName?: string;
  brewDate: string;
  status: BrewSessionStatus;
  batchSize?: number;
  batchSizeUnit?: 'L' | 'gal' | 'bbl';
  method?: 'all_grain' | 'partial_mash' | 'extract' | 'biab';
  actualOg?: number;
  actualFg?: number;
  actualAbv?: number;
  actualIbu?: number;
  actualSrm?: number;
  brewDurationMinutes?: number;
  fermentationDays?: number;
  conditioningDays?: number;
  ambientTemperature?: number;
  humidity?: number;
  totalCost?: number;
  costPerLiter?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SessionEvent {
  _id: string;
  sessionId: string;
  eventType: SessionEventType;
  timestamp: string;
  temperature?: number;
  gravityReading?: number;
  notes?: string;
  durationMinutes?: number;
  hopName?: string;
  hopWeight?: number;
  hopWeightUnit?: 'g' | 'oz' | 'lb';
  hopAlphaAcid?: number;
  hopBoilMinutes?: number;
  mashStepName?: string;
  targetTemp?: number;
  actualTemp?: number;
  createdAt?: string;
}

export interface BrewSessionListResponse {
  sessions: BrewSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const STATUS_LABELS: Record<BrewSessionStatus, string> = {
  planned: 'Planned',
  in_progress: 'In Progress',
  fermenting: 'Fermenting',
  conditioning: 'Conditioning',
  bottled: 'Bottled',
  consumed: 'Consumed',
};

export const STATUS_COLORS: Record<BrewSessionStatus, string> = {
  planned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-green-100 text-green-800',
  fermenting: 'bg-yellow-100 text-yellow-800',
  conditioning: 'bg-purple-100 text-purple-800',
  bottled: 'bg-gray-100 text-gray-800',
  consumed: 'bg-amber-100 text-amber-800',
};
