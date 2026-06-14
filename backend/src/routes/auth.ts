import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { auth } from '../middleware/auth';
import { generateToken } from '../utils/generateToken';
import User from '../models/User';
import PasswordResetToken from '../models/PasswordResetToken';
import { sendPasswordResetEmail } from '../services/email';

export const authRouter = Router();

const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('displayName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name must be between 1 and 50 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

authRouter.post(
  '/register',
  validate(registerValidation),
  async (req: Request, res: Response) => {
    try {
      const { username, email, password, displayName, brewLevel } = req.body;

      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        return res.status(400).json({ message: `${field} already exists` });
      }

      const user = new User({
        username,
        email,
        passwordHash: password,
        displayName,
        brewLevel,
      });

      await user.save();

      const token = generateToken(user._id.toString());

      res.status(201).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          brewLevel: user.brewLevel,
        },
      });
    } catch (error) {
      throw error;
    }
  }
);

authRouter.post(
  '/login',
  validate(loginValidation),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateToken(user._id.toString());

      res.status(200).json({
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          brewLevel: user.brewLevel,
        },
      });
    } catch (error) {
      throw error;
    }
  }
);

authRouter.get('/me', auth, async (req: Request, res: Response) => {
  try {
    const user = req.user;

    res.status(200).json({
      user: {
        id: user!._id,
        username: user!.username,
        email: user!.email,
        displayName: user!.displayName,
        brewLevel: user!.brewLevel,
      },
    });
  } catch (error) {
    throw error;
  }
});

// Forgot Password — send reset email
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

authRouter.post(
  '/forgot-password',
  validate(forgotPasswordValidation),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      // Always return success to prevent email enumeration
      if (!user) {
        return res.status(200).json({
          message: 'If an account exists with that email, a reset link has been sent.',
        });
      }

      // Delete any existing tokens for this user
      await PasswordResetToken.deleteMany({ userId: user._id });

      // Generate secure token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save token
      await PasswordResetToken.create({
        userId: user._id,
        token: resetToken,
        expiresAt,
      });

      // Send email
      await sendPasswordResetEmail({
        to: user.email,
        username: user.username,
        resetToken,
      });

      res.status(200).json({
        message: 'If an account exists with that email, a reset link has been sent.',
      });
    } catch (error) {
      throw error;
    }
  }
);

// Reset Password — validate token and update password
const resetPasswordValidation = [
  body('token')
    .trim()
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid reset token'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

authRouter.post(
  '/reset-password',
  validate(resetPasswordValidation),
  async (req: Request, res: Response) => {
    try {
      const { token, password } = req.body;

      // Find valid token
      const resetTokenDoc = await PasswordResetToken.findOne({
        token,
        expiresAt: { $gt: new Date() },
      });

      if (!resetTokenDoc) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Find user and update password
      const user = await User.findById(resetTokenDoc.userId);

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Set new password — pre-save hook will hash it
      user.passwordHash = password;
      await user.save();

      // Delete the used token
      await PasswordResetToken.deleteMany({ userId: user._id });

      res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
      throw error;
    }
  }
);
