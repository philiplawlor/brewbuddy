import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser, IUserMethods } from '../types/user';

const SALT_ROUNDS = 12;

export interface IUserDocument extends Document, IUserMethods {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  brewLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument, mongoose.Model<IUserDocument>>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be at most 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      maxlength: [50, 'Display name must be at most 50 characters'],
    },
    brewLevel: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced', 'professional'],
        message: 'Brew level must be beginner, intermediate, advanced, or professional',
      },
      default: 'beginner',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUserDocument>('User', userSchema);

export default User;
