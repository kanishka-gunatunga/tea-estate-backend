import type { Request, Response } from 'express';
import { prisma } from '../config/database';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Tea Estate System API is running',
    timestamp: new Date().toISOString(),
  });
}

export async function getHealthDb(_req: Request, res: Response): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json({
    success: true,
    message: 'Database connection is healthy',
    timestamp: new Date().toISOString(),
  });
}
