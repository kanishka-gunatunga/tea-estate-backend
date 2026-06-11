import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import { ErrorCode } from '../utils/api-errors';
import { getParam } from '../utils/params';
import { AppError } from './error.middleware';

export function requireRoles(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required', ErrorCode.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions', ErrorCode.FORBIDDEN));
      return;
    }

    next();
  };
}

function collectEstateIds(req: Request): string[] {
  const ids: string[] = [];

  if (req.query.estateId) {
    ids.push(getParam(req.query.estateId as string | string[]));
  }

  if (typeof req.body?.estateId === 'string') {
    ids.push(req.body.estateId);
  }

  if (req.params.estateId) {
    ids.push(getParam(req.params.estateId));
  }

  if (req.baseUrl.endsWith('/estates') && req.params.id) {
    ids.push(getParam(req.params.id));
  }

  return ids;
}

export async function enforceEstateScope(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    next(new AppError(401, 'Authentication required', ErrorCode.UNAUTHORIZED));
    return;
  }

  if (req.user.role === 'Administrator') {
    req.estateScope = null;
    next();
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { assignedEstateId: true },
  });

  if (!user?.assignedEstateId) {
    next(new AppError(403, 'No estate assigned to your account', ErrorCode.FORBIDDEN));
    return;
  }

  req.estateScope = user.assignedEstateId;

  const referencedEstateIds = collectEstateIds(req);

  for (const estateId of referencedEstateIds) {
    if (estateId !== user.assignedEstateId) {
      next(new AppError(403, 'Access denied for this estate', ErrorCode.FORBIDDEN));
      return;
    }
  }

  if (!req.query.estateId && req.method === 'GET') {
    req.query.estateId = user.assignedEstateId;
  }

  next();
}
