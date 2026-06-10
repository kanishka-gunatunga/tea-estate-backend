import type { Request, Response } from 'express';
import * as catalogService from '../services/catalog.service';
import { getParam } from '../utils/params';
import {
  createServiceSchema,
  serviceQuerySchema,
  updateServiceSchema,
} from '../validators/service.validator';

export async function listServices(req: Request, res: Response): Promise<void> {
  const query = serviceQuerySchema.parse(req.query);
  const services = await catalogService.listServices(query);

  res.status(200).json({ success: true, data: services });
}

export async function getService(req: Request, res: Response): Promise<void> {
  const service = await catalogService.getServiceById(getParam(req.params.id));

  res.status(200).json({ success: true, data: service });
}

export async function createService(req: Request, res: Response): Promise<void> {
  const body = createServiceSchema.parse(req.body);
  const service = await catalogService.createService(body);

  res.status(201).json({ success: true, data: service });
}

export async function updateService(req: Request, res: Response): Promise<void> {
  const body = updateServiceSchema.parse(req.body);
  const service = await catalogService.updateService(getParam(req.params.id), body);

  res.status(200).json({ success: true, data: service });
}

export async function deleteService(req: Request, res: Response): Promise<void> {
  const result = await catalogService.deleteService(getParam(req.params.id));

  res.status(200).json({ success: true, data: result });
}
