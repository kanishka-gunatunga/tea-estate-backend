import * as analytics from './analytics.service';
import { parseDateOnly } from '../utils/date';

export async function getKpis(estateId: string, startDate: string, endDate: string) {
  await analytics.validateEstate(estateId);

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  const [workers, pluckedKg, payrollLkr, expensesLkr] = await Promise.all([
    analytics.getActiveWorkersRatio(estateId),
    analytics.sumPluckedKg(estateId, start, end),
    analytics.sumPayroll(estateId, start, end),
    analytics.sumExpenses(estateId, start, end),
  ]);

  return {
    activeWorkers: workers,
    pluckedKg,
    payrollLkr,
    expensesLkr,
  };
}

export async function getExpenseBreakdown(
  estateId: string,
  startDate: string,
  endDate: string,
) {
  await analytics.validateEstate(estateId);

  return analytics.getExpenseBreakdown(
    estateId,
    parseDateOnly(startDate),
    parseDateOnly(endDate),
  );
}

export async function getMonthlyTrends(estateId: string, year: number) {
  await analytics.validateEstate(estateId);

  return analytics.getMonthlyTrends(estateId, year);
}

export async function getSectionHarvest(
  estateId: string,
  startDate: string,
  endDate: string,
) {
  await analytics.validateEstate(estateId);

  return analytics.getSectionHarvest(
    estateId,
    parseDateOnly(startDate),
    parseDateOnly(endDate),
  );
}

export async function getUpcomingEvents(
  estateId: string,
  fromDate: string | undefined,
  limit: number,
) {
  await analytics.validateEstate(estateId);

  const from = fromDate ? parseDateOnly(fromDate) : analytics.getTodayAndMonthRanges().today;

  return analytics.getUpcomingEvents(estateId, from, limit);
}
