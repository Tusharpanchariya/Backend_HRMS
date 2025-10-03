// employee.validation.ts
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// Base employee schema
const employeeBodySchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  // departmentName: z.string().min(2, "Department name is required"),
  // designation: z.string().min(2),
  joiningDate: z.string().datetime(),
  // employeeType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
  contactNumber: z.string().min(10, "Invalid phone number"),
  // address: z.string().min(5),
  // city: z.string().min(2),
  // state: z.string().min(2, "State name is required"),
  // pinCode: z.string().regex(/^[1-9][0-9]{5}$/, "PIN code must be 6 digits (1-9 followed by 5 digits)"),
  // dateOfBirth: z.string().datetime(),
  // emergencyContact: z.string().min(10, "Invalid emergency contact"),
  // trainingStatus: z.enum(['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED', 'REQUIRED', 'NOT_REQUIRED']),
  // userEmail: z.string().email().optional()
});

// Create Employee Schema (as plain object)
export const createEmployeeSchema = {
  body: employeeBodySchema
};

// Update Employee Schema (as plain object)
export const updateEmployeeSchema = {
  body: employeeBodySchema.partial(),
  params: z.object({
    id: z.string().regex(/^\d+$/, "Employee ID must be a number")
  })
};

// Employee ID Schema (as plain object)
export const employeeIdSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, "Employee ID must be a number")
  })
};

export const getEmployeesSchema = {
  query: z.object({
    name: z.string().optional(), // Add this line
    department: z.string().optional(),
    state: z.string().optional(),
    status: z.enum(['ACTIVE', 'RESIGNED', 'ON_LEAVE']).optional(),
    page: z.string().regex(/^\d+$/).optional().default('1'),
    limit: z.string().regex(/^\d+$/).optional().default('10')
  })
};
// Type exports
export type CreateEmployeeInput = {
  body: z.infer<typeof employeeBodySchema>;
};
export type UpdateEmployeeInput = {
  body: Partial<z.infer<typeof employeeBodySchema>>,
  params: { id: string }
};
export type EmployeeIdParams = {
  params: { id: string }
};
