import { z } from 'zod';

const estateStatusSchema = z.enum(['active', 'inactive']);

export const estateQuerySchema = z.object({
  status: estateStatusSchema.optional(),
  estateId: z.string().optional(),
});

export const createEstateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().min(1, 'Location is required'),
  mapsLink: z.string().optional(),
  area: z.number().positive().optional(),
  establishedYear: z.number().int().min(1800).max(2100).optional(),
  planter: z.string().optional(),
  supervisor: z.string().optional(),
  status: estateStatusSchema.default('active'),
});

export const updateEstateSchema = createEstateSchema.partial();

export const createSectionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  area: z.number().positive().optional(),
  description: z.string().optional(),
});

export const updateSectionSchema = createSectionSchema.partial();
