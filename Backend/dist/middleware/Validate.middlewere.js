"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
const http_status_codes_1 = require("http-status-codes");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            // Validate all parts of the request against their schemas
            await Promise.all([
                schema.body?.parseAsync(req.body),
                schema.params?.parseAsync(req.params),
                schema.query?.parseAsync(req.query),
            ]);
            return next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                // Format Zod validation errors into a user-friendly format
                const validationError = (0, zod_validation_error_1.fromZodError)(error, {
                    prefix: null,
                    includePath: true,
                });
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationError.details.map((detail) => ({
                        path: detail.path.join('.'),
                        message: detail.message,
                    })),
                });
            }
            // Handle unexpected errors
            return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Internal server error during validation',
            });
        }
    };
};
exports.validateRequest = validateRequest;
