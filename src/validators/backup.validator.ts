import { z } from 'zod';

export const createBackupSchema = z.object({
  type: z.enum(['Manual']).default('Manual'),
});
