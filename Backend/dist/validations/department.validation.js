"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
// In your validation file (e.g., department.validation.ts)
const zod_1 = require("zod");
// Only declare this ONCE in your entire project
exports.createDepartmentSchema = {
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        description: zod_1.z.string().optional()
    })
};
// If you need other schemas, give them unique names
exports.updateDepartmentSchema = {
    body: zod_1.z.object({
    /* ... */
    }),
    params: zod_1.z.object({
    /* ... */
    })
};
