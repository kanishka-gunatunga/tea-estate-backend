import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import {
  buildErrorResponse,
  codeFromStatus,
  ErrorCode,
  type ErrorCode as ErrorCodeType,
} from '../utils/api-errors';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: ErrorCodeType,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const code = err.code ?? codeFromStatus(err.statusCode);
    res.status(err.statusCode).json(buildErrorResponse(code, err.message));
    return;
  }

  if (err instanceof ZodError) {
    res
      .status(400)
      .json(
        buildErrorResponse(
          ErrorCode.VALIDATION_ERROR,
          'Validation failed',
          err.flatten().fieldErrors,
        ),
      );
    return;
  }

  logger.error('Unhandled error', {
    name: err.name,
    message: err.message,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  res.status(500).json(
    buildErrorResponse(
      ErrorCode.INTERNAL_ERROR,
      env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ),
  );
}
