import type { Request, Response } from 'express';
import * as estateService from '../services/estate.service';
import { getParam } from '../utils/params';
import {
  createEstateSchema,
  createSectionSchema,
  estateQuerySchema,
  updateEstateSchema,
  updateSectionSchema,
} from '../validators/estate.validator';

export async function listEstates(req: Request, res: Response): Promise<void> {
  const query = estateQuerySchema.parse(req.query);
  const estates = await estateService.listEstates(query.status, query.estateId);

  res.status(200).json({ success: true, data: estates });
}

export async function getEstate(req: Request, res: Response): Promise<void> {
  const estate = await estateService.getEstateById(getParam(req.params.id));

  res.status(200).json({ success: true, data: estate });
}

export async function createEstate(req: Request, res: Response): Promise<void> {
  const body = createEstateSchema.parse(req.body);
  const estate = await estateService.createEstate(body);

  res.status(201).json({ success: true, data: estate });
}

export async function updateEstate(req: Request, res: Response): Promise<void> {
  const body = updateEstateSchema.parse(req.body);
  const estate = await estateService.updateEstate(getParam(req.params.id), body);

  res.status(200).json({ success: true, data: estate });
}

export async function deleteEstate(req: Request, res: Response): Promise<void> {
  const estate = await estateService.deleteEstate(getParam(req.params.id));

  res.status(200).json({ success: true, data: estate });
}

export async function createSection(req: Request, res: Response): Promise<void> {
  const body = createSectionSchema.parse(req.body);
  const estate = await estateService.createSection(getParam(req.params.estateId), body);

  res.status(201).json({ success: true, data: estate });
}

export async function updateSection(req: Request, res: Response): Promise<void> {
  const body = updateSectionSchema.parse(req.body);
  const estate = await estateService.updateSection(
    getParam(req.params.estateId),
    getParam(req.params.sectionId),
    body,
  );

  res.status(200).json({ success: true, data: estate });
}

export async function deleteSection(req: Request, res: Response): Promise<void> {
  const estate = await estateService.deleteSection(
    getParam(req.params.estateId),
    getParam(req.params.sectionId),
  );

  res.status(200).json({ success: true, data: estate });
}
