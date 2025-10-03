import { z } from 'zod';

// Base state schema
const stateBodySchema = z.object({
  name: z.string()
    .min(2, "State name must be at least 2 characters")
    .max(50, "State name cannot exceed 50 characters"),
  code: z.string()
    .length(2, "State code must be exactly 2 characters")
    .regex(/^[A-Z]+$/, "State code must be uppercase letters only")
});

// Create State Validation Schema
export const createStateSchema = {
  body: stateBodySchema
};

// Update State Validation Schema
export const updateStateSchema = {
  body: stateBodySchema.partial(),
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric value")
  })
};

// Type Definitions
export type CreateStateInput = z.infer<typeof stateBodySchema>;
export type UpdateStateInput = {
  body: Partial<z.infer<typeof stateBodySchema>>,
  params: { id: string }
};