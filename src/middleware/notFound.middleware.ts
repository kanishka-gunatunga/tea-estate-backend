import type { Request, Response } from 'express';
import { buildErrorResponse, ErrorCode } from '../utils/api-errors';

export function notFoundHandler(_req: Request, res: Response): void {
  res
    .status(404)
    .json(buildErrorResponse(ErrorCode.NOT_FOUND, 'Route not found'));
}
