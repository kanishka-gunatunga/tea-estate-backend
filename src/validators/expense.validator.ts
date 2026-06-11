import { z } from 'zod';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const expenseQuerySchema = z.object({
  date: dateString.optional(),
  category: z.enum(['Transport', 'Tools', 'Utilities', 'Other']).optional(),
  estateId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export const createExpenseSchema = z.object({
  date: dateString,
  category: z.enum(['Transport', 'Tools', 'Utilities', 'Other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  estateId: z.string().min(1),
  sectionId: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
});

export const updateExpenseSchema = createExpenseSchema.partial();
