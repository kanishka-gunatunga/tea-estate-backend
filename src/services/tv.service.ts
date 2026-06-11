import * as analytics from './analytics.service';
import { formatDateOnly } from '../utils/date';

export async function getTvDashboard(estateId: string) {
  await analytics.validateEstate(estateId);

  const { today, monthRange } = analytics.getTodayAndMonthRanges();

  const [
    todayHarvestKg,
    monthHarvestKg,
    todayPayroll,
    monthPayroll,
    todayExpenses,
    monthExpenses,
    sectionHarvest,
    recentAssignments,
    upcomingEvents,
  ] = await Promise.all([
    analytics.sumHarvestKg(estateId, today, today),
    analytics.sumHarvestKg(estateId, monthRange.start, monthRange.end),
    analytics.sumPayroll(estateId, today, today),
    analytics.sumPayroll(estateId, monthRange.start, monthRange.end),
    analytics.sumExpenses(estateId, today, today),
    analytics.sumExpenses(estateId, monthRange.start, monthRange.end),
    analytics.getSectionHarvest(estateId, monthRange.start, monthRange.end),
    analytics.getRecentAssignments(estateId, today),
    analytics.getUpcomingEvents(estateId, today, 5),
  ]);

  return {
    serverDate: formatDateOnly(today),
    todayHarvestKg,
    monthHarvestKg,
    todayPayroll,
    monthPayroll,
    todayExpenses,
    monthExpenses,
    sectionHarvest,
    recentAssignments,
    upcomingEvents,
  };
}
