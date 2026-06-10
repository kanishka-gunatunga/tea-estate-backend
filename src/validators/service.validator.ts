import { z } from 'zod';

export const serviceQuerySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
});

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  rate: z.number().positive('Rate must be greater than 0'),
  unitType: z.enum(['Hours', 'Acres', 'Units', 'KG']),
});

export const updateServiceSchema = createServiceSchema.partial();
