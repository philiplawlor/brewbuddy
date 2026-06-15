import { Document, Types } from 'mongoose';

export interface IMashStep {
  name: string;
  type: 'infusion' | 'temperature' | 'decoction';
  infuseAmount?: number;
  stepTemp?: number;
  stepTime?: number;
  rampTime?: number;
  endTemp?: number;
}

export interface IMashProfile {
  name?: string;
  grainTemp?: number;
  tunTemp?: number;
  spargeTemp?: number;
  ph?: number;
  steps: IMashStep[];
}

export interface IFermentationStage {
  name: string;
  targetTemp?: number;
  durationDays?: number;
  notes?: string;
}

export interface IFermentationProfile {
  name?: string;
  stages: IFermentationStage[];
}

export interface IStyleProfile {
  categoryNumber?: string;
  category?: string;
  styleLetter?: string;
  styleGuide?: string;
  name?: string;
  version?: string;
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

export interface IEquipment {
  name?: string;
  tunVolume?: number;
  tunWeight?: number;
  tunSpecificHeat?: number;
  mashTunVolume?: number;
  mashTunWeight?: number;
  mashTunSpecificHeat?: number;
  lauterTunVolume?: number;
  lauterTunWeight?: number;
  lauterTunSpecificHeat?: number;
  boilKettleVolume?: number;
  boilKettleWeight?: number;
  boilKettleSpecificHeat?: number;
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

export interface IInstruction {
  name?: string;
  amount?: number;
  amountIsWeight?: boolean;
  time?: number;
  step?: number;
}

export interface IMiscIngredient {
  name: string;
  type?: string;
  amount?: number;
  amountIsWeight?: boolean;
  useFor?: string;
  use?: string;
  time?: number;
  notes?: string;
}

export interface IRecipe {
  userId: Types.ObjectId;
  recipeName: string;
  style?: string;
  styleCode?: string;
  version: number;
  isTemplate: boolean;
  isPublic: boolean;
  isArchived: boolean;
  method: 'all_grain' | 'partial_mash' | 'extract' | 'biab';

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

  actualOg?: number;
  actualFg?: number;
  actualAbv?: number;
  actualIbu?: number;
  actualSrm?: number;

  notes?: string;
  tasteNotes?: string;
  tasteRating?: number;

  averageRating?: number;
  ratingCount?: number;

  brewer?: string;
  asstBrewer?: string;
  brewDate?: Date;

  mashProfile?: IMashProfile;
  fermentationProfile?: IFermentationProfile;
  styleProfile?: IStyleProfile;
  equipment?: IEquipment;
  instructions?: IInstruction[];
  miscIngredients?: IMiscIngredient[];

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

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecipeMethods {}

export type RecipeDocument = IRecipe & Document & IRecipeMethods;

export interface IRecipeIngredient {
  recipeId: Types.ObjectId;
  ingredientType: 'grain' | 'hops' | 'yeast' | 'adjunct' | 'chemical' | 'misc';
  order: number;

  name?: string;
  category?: string;

  // Grain/Fermentable fields
  grainWeight?: number;
  grainWeightUnit?: 'lb' | 'kg' | 'g' | 'oz';
  lovibond?: number;
  potentialExtract?: number;
  yieldPercent?: number;
  grainType?: string;
  origin?: string;
  supplier?: string;
  grainNotes?: string;
  coarseFineDiff?: number;
  moisture?: number;
  protein?: number;
  maxInBatch?: number;
  recommendMash?: boolean;
  ibuGalPerLb?: number;

  // Hop fields
  hopsWeight?: number;
  hopsWeightUnit?: 'g' | 'oz' | 'lb';
  hopAdditionTime?: string;
  hopAlphaAcid?: number;
  hopBoilMinutes?: number;
  hopForm?: 'pellet' | 'whole_leaf' | 'extract' | 'cryo';
  hopOrigin?: string;
  hopType?: string;
  hopNotes?: string;
  hopBetaAcid?: number;
  hopHsi?: number;
  hopHumulene?: number;
  hopCaryophyllene?: number;
  hopCohumulone?: number;
  hopMyrcene?: number;
  hopSubstitutes?: string;
  hopProducer?: string;
  hopProductId?: string;
  hopYear?: string;

  // Yeast fields
  yeastPackageCount?: number;
  yeastStarterSizeMl?: number;
  yeastCellCount?: number;
  yeastType?: string;
  yeastForm?: string;
  strainId?: string;
  laboratory?: string;
  yeastAmount?: number;
  yeastAmountUnit?: string;
  yeastFlocculation?: string;
  yeastAttenuationMin?: number;
  yeastAttenuationMax?: number;
  yeastMinTemperature?: number;
  yeastMaxTemperature?: number;
  yeastTimesCultured?: number;
  yeastMaxReuse?: number;
  yeastAddToSecondary?: boolean;
  yeastBestFor?: string;
  yeastNotes?: string;

  // Misc fields
  miscType?: string;
  miscUse?: string;
  miscUseFor?: string;
  miscAmountIsWeight?: boolean;
  miscTime?: number;
  miscNotes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export type RecipeIngredientDocument = IRecipeIngredient & Document;
