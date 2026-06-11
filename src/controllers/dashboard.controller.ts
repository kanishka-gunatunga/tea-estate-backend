import type { Request, Response } from 'express';
import * as dashboardService from '../services/dashboard.service';
import {
  dashboardDateRangeSchema,
  monthlyTrendsQuerySchema,
  upcomingEventsQuerySchema,
} from '../validators/dashboard.validator';

export async function getKpis(req: Request, res: Response): Promise<void> {
  const query = dashboardDateRangeSchema.parse(req.query);
  const data = await dashboardService.getKpis(
    query.estateId,
    query.startDate,
    query.endDate,
  );

  res.status(200).json({ success: true, data });
}

export async function getExpenseBreakdown(req: Request, res: Response): Promise<void> {
  const query = dashboardDateRangeSchema.parse(req.query);
  const data = await dashboardService.getExpenseBreakdown(
    query.estateId,
    query.startDate,
    query.endDate,
  );

  res.status(200).json({ success: true, data });
}

export async function getMonthlyTrends(req: Request, res: Response): Promise<void> {
  const query = monthlyTrendsQuerySchema.parse(req.query);
  const data = await dashboardService.getMonthlyTrends(query.estateId, query.year);

  res.status(200).json({ success: true, data });
}

export async function getSectionHarvest(req: Request, res: Response): Promise<void> {
  const query = dashboardDateRangeSchema.parse(req.query);
  const data = await dashboardService.getSectionHarvest(
    query.estateId,
    query.startDate,
    query.endDate,
  );

  res.status(200).json({ success: true, data });
}

export async function getUpcomingEvents(req: Request, res: Response): Promise<void> {
  const query = upcomingEventsQuerySchema.parse(req.query);
  const data = await dashboardService.getUpcomingEvents(
    query.estateId,
    query.fromDate,
    query.limit,
  );

  res.status(200).json({ success: true, data });
}
