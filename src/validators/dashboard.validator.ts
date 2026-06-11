import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const dashboardDateRangeSchema = z.object({
  estateId: z.string().min(1),
  startDate: dateString,
  endDate: dateString,
});

export const monthlyTrendsQuerySchema = z.object({
  estateId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const upcomingEventsQuerySchema = z.object({
  estateId: z.string().min(1),
  fromDate: dateString.optional(),
  limit: z.coerce.number().int().positive().max(20).default(5),
});

export const tvDashboardQuerySchema = z.object({
  estateId: z.string().min(1),
});
