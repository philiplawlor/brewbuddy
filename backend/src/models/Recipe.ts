import mongoose, { Document, Schema } from 'mongoose';
import { IRecipe, RecipeDocument } from '../types/recipe';

const mashStepSchema = new Schema(
  {
    name: { type: String, trim: true },
    type: {
      type: String,
      enum: ['infusion', 'temperature', 'decoction'],
    },
    infuseAmount: { type: Number },
    stepTemp: { type: Number },
    stepTime: { type: Number },
    rampTime: { type: Number },
    endTemp: { type: Number },
  },
  { _id: false }
);

const fermentationStageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    targetTemp: { type: Number },
    durationDays: { type: Number },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const mashProfileSchema = new Schema(
  {
    name: { type: String, trim: true },
    grainTemp: { type: Number },
    tunTemp: { type: Number },
    spargeTemp: { type: Number },
    ph: { type: Number },
    steps: [mashStepSchema],
  },
  { _id: false }
);

const fermentationProfileSchema = new Schema(
  {
    name: { type: String, trim: true },
    stages: [fermentationStageSchema],
  },
  { _id: false }
);

const styleProfileSchema = new Schema(
  {
    categoryNumber: { type: String, trim: true },
    category: { type: String, trim: true },
    styleLetter: { type: String, trim: true },
    styleGuide: { type: String, trim: true },
    name: { type: String, trim: true },
    version: { type: String, trim: true },
    aroma: { type: String, trim: true },
    appearance: { type: String, trim: true },
    flavor: { type: String, trim: true },
    mouthfeel: { type: String, trim: true },
    overallImpression: { type: String, trim: true },
    profile: { type: String, trim: true },
    ingredients: { type: String, trim: true },
    examples: { type: String, trim: true },
    notes: { type: String, trim: true },
    ogMin: { type: Number },
    ogMax: { type: Number },
    fgMin: { type: Number },
    fgMax: { type: Number },
    ibuMin: { type: Number },
    ibuMax: { type: Number },
    colorMin: { type: Number },
    colorMax: { type: Number },
    abvMin: { type: Number },
    abvMax: { type: Number },
    carbonationMin: { type: Number },
    carbonationMax: { type: Number },
  },
  { _id: false }
);

const equipmentSchema = new Schema(
  {
    name: { type: String, trim: true },
    tunVolume: { type: Number },
    tunWeight: { type: Number },
    tunSpecificHeat: { type: Number },
    mashTunVolume: { type: Number },
    mashTunWeight: { type: Number },
    mashTunSpecificHeat: { type: Number },
    lauterTunVolume: { type: Number },
    lauterTunWeight: { type: Number },
    lauterTunSpecificHeat: { type: Number },
    boilKettleVolume: { type: Number },
    boilKettleWeight: { type: Number },
    boilKettleSpecificHeat: { type: Number },
    boilTime: { type: Number },
    lauterDeadSpace: { type: Number },
    topUpWater: { type: Number },
    trubChillerLoss: { type: Number },
    evapRate: { type: Number },
    calculatedBoilSize: { type: Number },
    calculatedBatchSize: { type: Number },
    equipmentLoss: { type: Number },
    whirlpoolTime: { type: Number },
    whirlpoolTemp: { type: Number },
  },
  { _id: false }
);

const instructionSchema = new Schema(
  {
    name: { type: String, trim: true },
    amount: { type: Number },
    amountIsWeight: { type: Boolean },
    time: { type: Number },
    step: { type: Number },
  },
  { _id: false }
);

const miscIngredientSchema = new Schema(
  {
    name: { type: String, trim: true },
    type: { type: String, trim: true },
    amount: { type: Number },
    amountIsWeight: { type: Boolean },
    useFor: { type: String, trim: true },
    use: { type: String, trim: true },
    time: { type: Number },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const recipeSchema = new Schema<RecipeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    recipeName: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
      maxlength: [100, 'Recipe name must be at most 100 characters'],
    },
    style: {
      type: String,
      trim: true,
      maxlength: [100, 'Style must be at most 100 characters'],
    },
    styleCode: {
      type: String,
      trim: true,
      maxlength: [10, 'Style code must be at most 10 characters'],
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1'],
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    method: {
      type: String,
      enum: {
        values: ['all_grain', 'partial_mash', 'extract', 'biab'],
        message: 'Method must be all_grain, partial_mash, extract, or biab',
      },
    },

    batchSize: {
      type: Number,
      min: [0, 'Batch size cannot be negative'],
    },
    batchSizeUnit: {
      type: String,
      enum: ['L', 'gal', 'bbl'],
      default: 'L',
    },
    boilSize: { type: Number },
    preBoilSize: { type: Number },
    boilTimeMinutes: {
      type: Number,
      min: [0, 'Boil time cannot be negative'],
    },
    efficiency: {
      type: Number,
      min: [0, 'Efficiency must be between 0 and 100'],
      max: [100, 'Efficiency must be between 0 and 100'],
    },

    estimatedOg: { type: Number },
    estimatedFg: { type: Number },
    estimatedAbv: { type: Number },
    estimatedIbu: { type: Number },
    estimatedSrm: { type: Number },
    estimatedCalories: { type: Number },

    actualOg: { type: Number },
    actualFg: { type: Number },
    actualAbv: { type: Number },
    actualIbu: { type: Number },
    actualSrm: { type: Number },

    notes: { type: String, trim: true },
    tasteNotes: { type: String, trim: true },
    tasteRating: {
      type: Number,
      min: [0, 'Taste rating must be between 0 and 50'],
      max: [50, 'Taste rating must be between 0 and 50'],
    },

    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    brewer: { type: String, trim: true },
    asstBrewer: { type: String, trim: true },
    brewDate: { type: Date },

    mashProfile: { type: mashProfileSchema },
    fermentationProfile: { type: fermentationProfileSchema },
    styleProfile: { type: styleProfileSchema },
    equipment: { type: equipmentSchema },
    instructions: [instructionSchema],
    miscIngredients: [miscIngredientSchema],

    carbonation: { type: Number },
    forcedCarbonation: { type: Boolean },
    primingSugarName: { type: String, trim: true },
    primingSugarEquiv: { type: Number },
    kegPrimingFactor: { type: Number },
    carbonationTemp: { type: Number },
    primaryAgeDays: { type: Number },
    primaryTemp: { type: Number },
    secondaryAgeDays: { type: Number },
    secondaryTemp: { type: Number },
    tertiaryAgeDays: { type: Number },
    tertiaryTemp: { type: Number },
    ageDays: { type: Number },
    ageTemp: { type: Number },
  },
  {
    timestamps: true,
  }
);

recipeSchema.index({ userId: 1 });
recipeSchema.index({ style: 1 });
recipeSchema.index({ isPublic: 1 });
recipeSchema.index({ createdAt: -1 });
recipeSchema.index({ recipeName: 'text' });

const Recipe = mongoose.model<RecipeDocument>('Recipe', recipeSchema);

export default Recipe;
