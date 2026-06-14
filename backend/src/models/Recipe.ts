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

    mashProfile: { type: mashProfileSchema },
    fermentationProfile: { type: fermentationProfileSchema },
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
