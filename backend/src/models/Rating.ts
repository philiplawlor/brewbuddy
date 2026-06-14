import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  recipeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  rating: number;
  createdAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// One rating per user per recipe
ratingSchema.index({ recipeId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model<IRating>('Rating', ratingSchema);

export default Rating;
