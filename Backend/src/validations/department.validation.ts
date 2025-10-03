// In your validation file (e.g., department.validation.ts)
import { z } from 'zod';

// Only declare this ONCE in your entire project
export const createDepartmentSchema = {
  body: z.object({
    name: z.string().min(2),
    description: z.string().optional()
  })
};

// If you need other schemas, give them unique names
export const updateDepartmentSchema = {
  body: z.object({
    /* ... */
  }),
  params: z.object({
    /* ... */
  })
};