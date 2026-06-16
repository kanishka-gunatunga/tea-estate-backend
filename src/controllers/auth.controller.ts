import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { AppError } from '../middleware/error.middleware';
import {
  changePasswordSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

export async function login(req: Request, res: Response): Promise<void> {
  const body = loginSchema.parse(req.body);
  const result = await authService.login(body.email, body.password);

  res.status(200).json({
    success: true,
    data: result,
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: { message: 'Logged out successfully' },
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const profile = await authService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: profile,
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const body = updateProfileSchema.parse(req.body);
  const profile = await authService.updateProfile(req.user.id, body);

  res.status(200).json({
    success: true,
    data: profile,
  });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  const body = changePasswordSchema.parse(req.body);
  await authService.changePassword(req.user.id, body.currentPassword, body.newPassword);

  res.status(200).json({
    success: true,
    data: { message: 'Password changed successfully' },
  });
}

export async function updateProfilePhoto(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new AppError(401, 'Authentication required');
  }

  if (!req.file) {
    throw new AppError(400, 'Photo file is required');
  }

  const profile = await authService.updateProfilePhoto(req.user.id, req.file);

  res.status(200).json({
    success: true,
    data: profile,
  });
}
