import type { NextFunction, Request, Response } from 'express';
import { ErrorCode } from '../utils/api-errors';
import { verifyToken } from '../utils/jwt';
import { AppError } from './error.middleware';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    next(new AppError(401, 'Authentication required', ErrorCode.UNAUTHORIZED));
    return;
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token', ErrorCode.UNAUTHORIZED));
  }
}
