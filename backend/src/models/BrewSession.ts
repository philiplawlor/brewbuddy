import mongoose, { Schema } from 'mongoose';
import { BrewSessionDocument } from '../types/brew-session';

const brewSessionSchema = new Schema<BrewSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe ID is required'],
    },
    recipeVersionId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
    },
    batchNumber: {
      type: String,
      trim: true,
      maxlength: [50, 'Batch number must be at most 50 characters'],
    },
    sessionName: {
      type: String,
      trim: true,
      maxlength: [200, 'Session name must be at most 200 characters'],
    },
    brewDate: {
      type: Date,
      required: [true, 'Brew date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['planned', 'in_progress', 'fermenting', 'conditioning', 'bottled', 'consumed'],
        message: 'Status must be planned, in_progress, fermenting, conditioning, bottled, or consumed',
      },
      default: 'planned',
    },

    // Batch Info
    batchSize: {
      type: Number,
      min: [0, 'Batch size cannot be negative'],
    },
    batchSizeUnit: {
      type: String,
      enum: ['L', 'gal', 'bbl'],
      default: 'L',
    },
    method: {
      type: String,
      enum: {
        values: ['all_grain', 'partial_mash', 'extract', 'biab'],
        message: 'Method must be all_grain, partial_mash, extract, or biab',
      },
    },

    // Actual Results
    actualOg: { type: Number },
    actualFg: { type: Number },
    actualAbv: { type: Number },
    actualIbu: { type: Number },
    actualSrm: { type: Number },

    // Timing
    brewDurationMinutes: {
      type: Number,
      min: [0, 'Brew duration cannot be negative'],
    },
    fermentationDays: {
      type: Number,
      min: [0, 'Fermentation days cannot be negative'],
    },
    conditioningDays: {
      type: Number,
      min: [0, 'Conditioning days cannot be negative'],
    },

    // Environment
    ambientTemperature: { type: Number },
    humidity: {
      type: Number,
      min: [0, 'Humidity must be between 0 and 100'],
      max: [100, 'Humidity must be between 0 and 100'],
    },

    // Cost
    totalCost: {
      type: Number,
      min: [0, 'Total cost cannot be negative'],
    },
    costPerLiter: {
      type: Number,
      min: [0, 'Cost per liter cannot be negative'],
    },

    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

brewSessionSchema.index({ userId: 1 });
brewSessionSchema.index({ recipeId: 1 });
brewSessionSchema.index({ status: 1 });
brewSessionSchema.index({ brewDate: -1 });

const BrewSession = mongoose.model<BrewSessionDocument>(
  'BrewSession',
  brewSessionSchema
);

export default BrewSession;
