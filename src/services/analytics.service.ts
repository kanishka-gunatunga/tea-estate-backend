import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { toNumber } from '../utils/decimal';
import {
  formatDateOnly,
  getCurrentMonthRange,
  getServerToday,
  parseDateOnly,
} from '../utils/date';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const leafPluckingServiceFilter = {
  OR: [{ name: 'Leaf Plucking' }, { unitType: 'KG' as const }],
};

export async function validateEstate(estateId: string) {
  const estate = await prisma.estate.findUnique({ where: { id: estateId } });

  if (!estate) {
    throw new AppError(404, 'Estate not found');
  }

  return estate;
}

export async function getActiveWorkersRatio(estateId: string) {
  const [active, total] = await Promise.all([
    prisma.employee.count({ where: { estateId, status: 'active' } }),
    prisma.employee.count({ where: { estateId } }),
  ]);

  return { active, total };
}

export async function sumPluckedKg(
  estateId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const workers = await prisma.workerAssignment.findMany({
    where: {
      dailyAssignment: {
        estateId,
        status: 'approved',
        date: { gte: startDate, lte: endDate },
        service: { name: 'Leaf Plucking' },
      },
    },
    select: { unitsCompleted: true },
  });

  return workers.reduce((sum, worker) => sum + toNumber(worker.unitsCompleted), 0);
}

export async function sumHarvestKg(
  estateId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const workers = await prisma.workerAssignment.findMany({
    where: {
      dailyAssignment: {
        estateId,
        status: 'approved',
        date: { gte: startDate, lte: endDate },
        service: leafPluckingServiceFilter,
      },
    },
    select: { unitsCompleted: true },
  });

  return workers.reduce((sum, worker) => sum + toNumber(worker.unitsCompleted), 0);
}

export async function sumPayroll(
  estateId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const result = await prisma.dailyAssignment.aggregate({
    where: {
      estateId,
      status: 'approved',
      date: { gte: startDate, lte: endDate },
    },
    _sum: { totalAmount: true },
  });

  return toNumber(result._sum.totalAmount ?? 0);
}

export async function sumExpenses(
  estateId: string,
  startDate: Date,
  endDate: Date,
): Promise<number> {
  const result = await prisma.expense.aggregate({
    where: {
      estateId,
      status: { not: 'rejected' },
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  return toNumber(result._sum.amount ?? 0);
}

export async function getExpenseBreakdown(
  estateId: string,
  startDate: Date,
  endDate: Date,
) {
  const expenses = await prisma.expense.groupBy({
    by: ['category'],
    where: {
      estateId,
      status: { not: 'rejected' },
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  const breakdown = {
    Utilities: 0,
    Transport: 0,
    Tools: 0,
    Other: 0,
  };

  for (const row of expenses) {
    const amount = toNumber(row._sum.amount ?? 0);
    if (row.category in breakdown) {
      breakdown[row.category as keyof typeof breakdown] += amount;
    } else {
      breakdown.Other += amount;
    }
  }

  return breakdown;
}

export async function getMonthlyTrends(estateId: string, year: number) {
  const trends = [];

  for (let month = 1; month <= 12; month += 1) {
    const start = parseDateOnly(
      `${year}-${String(month).padStart(2, '0')}-01`,
    );
    const end = new Date(Date.UTC(year, month, 0));

    const [payroll, expenses] = await Promise.all([
      sumPayroll(estateId, start, end),
      sumExpenses(estateId, start, end),
    ]);

    trends.push({
      month: MONTH_NAMES[month - 1],
      payroll,
      expenses,
    });
  }

  return trends;
}

export async function getSectionHarvest(
  estateId: string,
  startDate: Date,
  endDate: Date,
) {
  const workers = await prisma.workerAssignment.findMany({
    where: {
      dailyAssignment: {
        estateId,
        status: 'approved',
        date: { gte: startDate, lte: endDate },
        service: { name: 'Leaf Plucking' },
      },
    },
    include: {
      dailyAssignment: {
        include: { section: { select: { id: true, name: true } } },
      },
    },
  });

  const sectionMap = new Map<
    string,
    { sectionId: string; sectionName: string; totalHarvest: number; totalPayment: number; workerIds: Set<string> }
  >();

  for (const worker of workers) {
    const section = worker.dailyAssignment.section;
    const existing = sectionMap.get(section.id) ?? {
      sectionId: section.id,
      sectionName: section.name,
      totalHarvest: 0,
      totalPayment: 0,
      workerIds: new Set<string>(),
    };

    existing.totalHarvest += toNumber(worker.unitsCompleted);
    existing.totalPayment += toNumber(worker.paymentAmount);
    existing.workerIds.add(worker.employeeId);
    sectionMap.set(section.id, existing);
  }

  return Array.from(sectionMap.values()).map((section) => ({
    sectionId: section.sectionId,
    sectionName: section.sectionName,
    totalHarvest: section.totalHarvest,
    totalPayment: section.totalPayment,
    workerCount: section.workerIds.size,
  }));
}

export async function getUpcomingEvents(
  estateId: string,
  fromDate: Date,
  limit: number,
) {
  const events = await prisma.calendarEvent.findMany({
    where: {
      OR: [{ estateId }, { estateId: null }],
      startDate: { gte: fromDate },
    },
    orderBy: [{ startDate: 'asc' }, { title: 'asc' }],
    take: limit,
  });

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: formatDateOnly(event.startDate),
    endDate: event.endDate ? formatDateOnly(event.endDate) : null,
    recurrence: event.recurrence,
    color: event.color,
    category: event.category,
    estateId: event.estateId,
  }));
}

export async function getRecentAssignments(estateId: string, date: Date) {
  const assignments = await prisma.dailyAssignment.findMany({
    where: { estateId, date },
    include: {
      section: { select: { name: true } },
      service: { select: { name: true, unitType: true } },
      workerAssignments: {
        include: { employee: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return assignments.map((assignment) => ({
    id: assignment.id,
    date: formatDateOnly(assignment.date),
    sectionName: assignment.section.name,
    serviceName: assignment.service.name,
    unitType: assignment.service.unitType,
    status: assignment.status,
    totalAmount: toNumber(assignment.totalAmount),
    workers: assignment.workerAssignments.map((worker) => ({
      employeeId: worker.employee.id,
      workerName: worker.employee.name,
      unitsCompleted: toNumber(worker.unitsCompleted),
      paymentAmount: toNumber(worker.paymentAmount),
    })),
  }));
}

export function getTodayAndMonthRanges() {
  const today = getServerToday();
  const monthRange = getCurrentMonthRange(today);

  return { today, monthRange };
}
