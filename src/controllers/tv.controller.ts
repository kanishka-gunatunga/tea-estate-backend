import type { Request, Response } from 'express';
import * as tvService from '../services/tv.service';
import { tvDashboardQuerySchema } from '../validators/dashboard.validator';

export async function getTvDashboard(req: Request, res: Response): Promise<void> {
  const query = tvDashboardQuerySchema.parse(req.query);
  const data = await tvService.getTvDashboard(query.estateId);

  res.status(200).json({ success: true, data });
}
