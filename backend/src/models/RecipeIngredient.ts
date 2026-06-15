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
        values: ['grain', 'hops', 'yeast', 'adjunct', 'chemical', 'misc'],
        message: 'Ingredient type must be grain, hops, yeast, adjunct, chemical, or misc',
      },
    },
    order: {
      type: Number,
      default: 0,
    },

    name: { type: String, trim: true },
    category: { type: String, trim: true },

    // Grain/Fermentable fields
    grainWeight: { type: Number, min: [0, 'Grain weight cannot be negative'] },
    grainWeightUnit: {
      type: String,
      enum: ['lb', 'kg', 'g', 'oz'],
    },
    lovibond: { type: Number },
    potentialExtract: { type: Number },
    yieldPercent: { type: Number },
    grainType: { type: String, trim: true },
    origin: { type: String, trim: true },
    supplier: { type: String, trim: true },
    grainNotes: { type: String, trim: true },
    coarseFineDiff: { type: Number },
    moisture: { type: Number },
    protein: { type: Number },
    maxInBatch: { type: Number },
    recommendMash: { type: Boolean },
    ibuGalPerLb: { type: Number },

    // Hop fields
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
    hopOrigin: { type: String, trim: true },
    hopType: { type: String, trim: true },
    hopNotes: { type: String, trim: true },
    hopBetaAcid: { type: Number },
    hopHsi: { type: Number },
    hopHumulene: { type: Number },
    hopCaryophyllene: { type: Number },
    hopCohumulone: { type: Number },
    hopMyrcene: { type: Number },
    hopSubstitutes: { type: String, trim: true },
    hopProducer: { type: String, trim: true },
    hopProductId: { type: String, trim: true },
    hopYear: { type: String, trim: true },

    // Yeast fields
    yeastPackageCount: { type: Number },
    yeastStarterSizeMl: { type: Number },
    yeastCellCount: { type: Number },
    yeastType: { type: String, trim: true },
    yeastForm: { type: String, trim: true },
    strainId: { type: String, trim: true },
    laboratory: { type: String, trim: true },
    yeastAmount: { type: Number },
    yeastAmountUnit: { type: String, trim: true },
    yeastFlocculation: { type: String, trim: true },
    yeastAttenuationMin: { type: Number },
    yeastAttenuationMax: { type: Number },
    yeastMinTemperature: { type: Number },
    yeastMaxTemperature: { type: Number },
    yeastTimesCultured: { type: Number },
    yeastMaxReuse: { type: Number },
    yeastAddToSecondary: { type: Boolean },
    yeastBestFor: { type: String, trim: true },
    yeastNotes: { type: String, trim: true },

    // Misc fields
    miscType: { type: String, trim: true },
    miscUse: { type: String, trim: true },
    miscUseFor: { type: String, trim: true },
    miscAmountIsWeight: { type: Boolean },
    miscTime: { type: Number },
    miscNotes: { type: String, trim: true },
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
