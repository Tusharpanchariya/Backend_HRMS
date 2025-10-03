"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStateSchema = exports.createStateSchema = void 0;
const zod_1 = require("zod");
// Base state schema
const stateBodySchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, "State name must be at least 2 characters")
        .max(50, "State name cannot exceed 50 characters"),
    code: zod_1.z.string()
        .length(2, "State code must be exactly 2 characters")
        .regex(/^[A-Z]+$/, "State code must be uppercase letters only")
});
// Create State Validation Schema
exports.createStateSchema = {
    body: stateBodySchema
};
// Update State Validation Schema
exports.updateStateSchema = {
    body: stateBodySchema.partial(),
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^\d+$/, "ID must be a numeric value")
    })
};
