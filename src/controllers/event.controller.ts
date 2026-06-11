import type { Request, Response } from 'express';
import * as eventService from '../services/event.service';
import { getParam } from '../utils/params';
import {
  createEventSchema,
  eventQuerySchema,
  updateEventSchema,
} from '../validators/event.validator';

export async function listEvents(req: Request, res: Response): Promise<void> {
  const query = eventQuerySchema.parse(req.query);
  const events = await eventService.listEvents(query);

  res.status(200).json({ success: true, data: events });
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const event = await eventService.getEventById(getParam(req.params.id));

  res.status(200).json({ success: true, data: event });
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const body = createEventSchema.parse(req.body);
  const event = await eventService.createEvent(body);

  res.status(201).json({ success: true, data: event });
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const body = updateEventSchema.parse(req.body);
  const event = await eventService.updateEvent(getParam(req.params.id), body);

  res.status(200).json({ success: true, data: event });
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  const result = await eventService.deleteEvent(getParam(req.params.id));

  res.status(200).json({ success: true, data: result });
}
