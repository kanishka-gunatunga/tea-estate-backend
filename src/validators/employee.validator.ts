import { z } from 'zod';

export const employeeQuerySchema = z.object({
  estateId: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gender: z.enum(['Male', 'Female', 'Other']),
  phone: z.string().optional(),
  nic: z.string().min(10, 'Valid NIC is required'),
  estateId: z.string().min(1, 'Estate is required'),
  serviceCategories: z.array(z.string()).min(1, 'At least one service category is required'),
  status: z.enum(['active', 'inactive']).default('active'),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phone: z.string().optional(),
  nic: z.string().min(10).optional(),
  estateId: z.string().optional(),
  serviceCategories: z.array(z.string()).min(1).optional(),
  status: z.enum(['active', 'inactive']).optional(),
});
