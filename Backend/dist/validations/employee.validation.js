"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmployeesSchema = exports.employeeIdSchema = exports.updateEmployeeSchema = exports.createEmployeeSchema = void 0;
const zod_1 = require("zod");
// Base employee schema
const employeeBodySchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Full name must be at least 2 characters"),
    // departmentName: z.string().min(2, "Department name is required"),
    // designation: z.string().min(2),
    joiningDate: zod_1.z.string().datetime(),
    // employeeType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
    contactNumber: zod_1.z.string().min(10, "Invalid phone number"),
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
exports.createEmployeeSchema = {
    body: employeeBodySchema
};
// Update Employee Schema (as plain object)
exports.updateEmployeeSchema = {
    body: employeeBodySchema.partial(),
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "Employee ID must be a number")
    })
};
// Employee ID Schema (as plain object)
exports.employeeIdSchema = {
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "Employee ID must be a number")
    })
};
exports.getEmployeesSchema = {
    query: zod_1.z.object({
        name: zod_1.z.string().optional(), // Add this line
        department: zod_1.z.string().optional(),
        state: zod_1.z.string().optional(),
        status: zod_1.z.enum(['ACTIVE', 'RESIGNED', 'ON_LEAVE']).optional(),
        page: zod_1.z.string().regex(/^\d+$/).optional().default('1'),
        limit: zod_1.z.string().regex(/^\d+$/).optional().default('10')
    })
};
