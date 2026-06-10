import { z } from 'zod';

export const userQuerySchema = z.object({
  role: z.enum(['Administrator', 'Planter', 'Supervisor']).optional(),
  search: z.string().optional(),
});

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  phone: z.string().optional(),
  role: z.enum(['Administrator', 'Planter', 'Supervisor']),
  assignedEstateId: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  phone: z.string().optional(),
  role: z.enum(['Administrator', 'Planter', 'Supervisor']).optional(),
  assignedEstateId: z.string().nullable().optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
