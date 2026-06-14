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

  mashProfile?: IMashProfile;
  fermentationProfile?: IFermentationProfile;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecipeMethods {}

export type RecipeDocument = IRecipe & Document & IRecipeMethods;

export interface IRecipeIngredient {
  recipeId: Types.ObjectId;
  ingredientType: 'grain' | 'hops' | 'yeast' | 'adjunct' | 'chemical';
  order: number;

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

  createdAt?: Date;
  updatedAt?: Date;
}

export type RecipeIngredientDocument = IRecipeIngredient & Document;
