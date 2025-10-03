import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { StatusCodes } from 'http-status-codes';

export const validateRequest = (schema: {
  body?: ZodObject;
  params?: ZodObject;
  query?: ZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate all parts of the request against their schemas
      await Promise.all([
        schema.body?.parseAsync(req.body),
        schema.params?.parseAsync(req.params),
        schema.query?.parseAsync(req.query),
      ]);
      
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors into a user-friendly format
        const validationError = fromZodError(error, {
          prefix: null,
          includePath: true,
        });

        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: 'Validation failed',
          errors: validationError.details.map((detail) => ({
            path: detail.path.join('.'),
            message: detail.message,
          })),
        });
      }

      // Handle unexpected errors
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error during validation',
      });
    }
  };
};