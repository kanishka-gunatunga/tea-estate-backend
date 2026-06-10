import type { Request, Response } from 'express';
import { prisma } from '../config/database';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    data: {
      message: 'Tea Estate System API is running',
      timestamp: new Date().toISOString(),
    },
  });
}

export async function getHealthDb(_req: Request, res: Response): Promise<void> {
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json({
    success: true,
    data: {
      message: 'Database connection is healthy',
      timestamp: new Date().toISOString(),
    },
  });
}

export async function getHealthStats(_req: Request, res: Response): Promise<void> {
  const [
    estates,
    sections,
    users,
    employees,
    services,
    assignments,
    workerAssignments,
    expenses,
    events,
    backupSettings,
  ] = await Promise.all([
    prisma.estate.count(),
    prisma.section.count(),
    prisma.user.count(),
    prisma.employee.count(),
    prisma.service.count(),
    prisma.dailyAssignment.count(),
    prisma.workerAssignment.count(),
    prisma.expense.count(),
    prisma.calendarEvent.count(),
    prisma.backupSettings.count(),
  ]);

  const seeded = users > 0 && estates > 0 && services > 0;

  res.status(200).json({
    success: true,
    data: {
      seeded,
      counts: {
        estates,
        sections,
        users,
        employees,
        services,
        assignments,
        workerAssignments,
        expenses,
        events,
        backupSettings,
      },
      sampleIds: seeded
        ? {
            estateId: 'estate-1',
            sectionId: 'sec-1',
            serviceId: 'service-6',
            employeeId: 'EMP001',
            adminEmail: 'admin@gmail.com',
          }
        : null,
    },
  });
}
