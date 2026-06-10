import mongoose, { Document, Schema } from 'mongoose';
import { IRecipeIngredient, RecipeIngredientDocument } from '../types/recipe';

const recipeIngredientSchema = new Schema<RecipeIngredientDocument>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe ID is required'],
    },
    ingredientType: {
      type: String,
      required: [true, 'Ingredient type is required'],
      enum: {
        values: ['grain', 'hops', 'yeast', 'adjunct', 'chemical'],
        message: 'Ingredient type must be grain, hops, yeast, adjunct, or chemical',
      },
    },
    order: {
      type: Number,
      default: 0,
    },

    name: { type: String, trim: true },
    category: { type: String, trim: true },
    grainWeight: { type: Number, min: [0, 'Grain weight cannot be negative'] },
    grainWeightUnit: {
      type: String,
      enum: ['lb', 'kg', 'g', 'oz'],
    },
    lovibond: { type: Number },
    potentialExtract: { type: Number },
    yieldPercent: { type: Number },

    hopsWeight: { type: Number, min: [0, 'Hops weight cannot be negative'] },
    hopsWeightUnit: {
      type: String,
      enum: ['g', 'oz', 'lb'],
    },
    hopAdditionTime: { type: String, trim: true },
    hopAlphaAcid: { type: Number },
    hopBoilMinutes: { type: Number },
    hopForm: {
      type: String,
      enum: ['pellet', 'whole_leaf', 'extract', 'cryo'],
    },

    yeastPackageCount: { type: Number },
    yeastStarterSizeMl: { type: Number },
    yeastCellCount: { type: Number },
    yeastType: { type: String, trim: true },
    yeastForm: { type: String, trim: true },
    strainId: { type: String, trim: true },
    laboratory: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

recipeIngredientSchema.index({ recipeId: 1 });
recipeIngredientSchema.index({ ingredientType: 1 });

const RecipeIngredient = mongoose.model<RecipeIngredientDocument>(
  'RecipeIngredient',
  recipeIngredientSchema
);

export default RecipeIngredient;
