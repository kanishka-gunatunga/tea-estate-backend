import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const eventQuerySchema = z.object({
  startDate: dateString.optional(),
  endDate: dateString.optional(),
  estateId: z.string().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: dateString,
  endDate: dateString.optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a hex value like #3B82F6'),
  category: z.enum([
    'Meeting',
    'Cultivation',
    'Maintenance',
    'Review',
    'Finance',
    'Training',
    'Other',
  ]),
  estateId: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();
