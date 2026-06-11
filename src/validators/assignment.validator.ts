import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const assignmentQuerySchema = z.object({
  date: dateString.optional(),
  estateId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'completed']).optional(),
});

export const createAssignmentSchema = z.object({
  date: dateString,
  estateId: z.string().min(1),
  sectionId: z.string().min(1),
  serviceId: z.string().min(1),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const updateAssignmentStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'completed']),
});

export const addWorkerSchema = z.object({
  employeeId: z.string().min(1),
  unitsCompleted: z.number().min(0, 'Units must be 0 or greater'),
});

export const updateWorkerSchema = z.object({
  unitsCompleted: z.number().min(0, 'Units must be 0 or greater'),
});
