import { z } from "zod";

export const errorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const validationErrorResponseSchema = errorResponseSchema.extend({
  errors: z.array(z.unknown()).optional(),
});

export const sharedErrorResponses = {
  400: errorResponseSchema,
  401: errorResponseSchema,
  403: errorResponseSchema,
  422: validationErrorResponseSchema,
  500: errorResponseSchema,
};
