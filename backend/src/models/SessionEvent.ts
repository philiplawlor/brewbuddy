import mongoose, { Schema } from 'mongoose';
import { SessionEventDocument } from '../types/brew-session';

const sessionEventSchema = new Schema<SessionEventDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'BrewSession',
      required: [true, 'Session ID is required'],
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: [
          'mash_in',
          'mash_step',
          'mash_out',
          'vorlauf',
          'sparge',
          'boil_start',
          'hop_addition',
          'whirlpool',
          'flameout',
          'chill',
          'pitch_yeast',
          'transfer',
        ],
        message:
          'Event type must be a valid brew day event',
      },
    },
    timestamp: {
      type: Date,
      required: [true, 'Timestamp is required'],
      default: Date.now,
    },
    temperature: { type: Number },
    gravityReading: { type: Number },
    notes: { type: String, trim: true },
    durationMinutes: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },

    // Hop Addition Specific
    hopName: { type: String, trim: true },
    hopWeight: {
      type: Number,
      min: [0, 'Hop weight cannot be negative'],
    },
    hopWeightUnit: {
      type: String,
      enum: ['g', 'oz', 'lb'],
    },
    hopAlphaAcid: {
      type: Number,
      min: [0, 'Alpha acid must be between 0 and 100'],
      max: [100, 'Alpha acid must be between 0 and 100'],
    },
    hopBoilMinutes: {
      type: Number,
      min: [0, 'Hop boil minutes cannot be negative'],
    },

    // Mash Step Specific
    mashStepName: { type: String, trim: true },
    targetTemp: { type: Number },
    actualTemp: { type: Number },
  },
  {
    timestamps: true,
  }
);

sessionEventSchema.index({ sessionId: 1, timestamp: 1 });
sessionEventSchema.index({ sessionId: 1, eventType: 1 });

const SessionEvent = mongoose.model<SessionEventDocument>(
  'SessionEvent',
  sessionEventSchema
);

export default SessionEvent;
