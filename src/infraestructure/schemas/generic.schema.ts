import { z } from "zod";

export const genericRequestSchema = z.object({
  name: z.string(),
  lastName: z.string(),
  age: z.number(),
});

export const genericParamsSchema = z.object({
  id: z.string().min(1),
});

export const pokemonParamsSchema = z.object({
  name: z.string().min(1),
});

export const genericResponseSchema = z.object({
  name: z.string().optional(),
  lastName: z.string().optional(),
  age: z.number().optional(),
});

export const pokemonResponseSchema = z.object({
  name: z.string(),
  height: z.number(),
  weight: z.number(),
});

export const updateGenericResponseSchema = z.object({
  message: z.string(),
  result: genericResponseSchema,
});
