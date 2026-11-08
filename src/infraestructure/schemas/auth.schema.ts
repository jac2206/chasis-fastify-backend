import { z } from "zod";

export const clientCredentialsRequestSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
});

export const clientCredentialsResponseSchema = z.object({
  token: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int().positive(),
});

export const createServiceClientRequestSchema = z.object({
  clientId: z.string().min(3).max(100),
  scopes: z.array(z.string().min(1)).min(1),
});

export const createServiceClientResponseSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  scopes: z.array(z.string()),
});

export const serviceClientParamsSchema = z.object({
  clientId: z.string().min(1),
});

export const rotateServiceClientResponseSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
});

export const serviceClientStatusResponseSchema = z.object({
  clientId: z.string(),
  status: z.boolean(),
});
