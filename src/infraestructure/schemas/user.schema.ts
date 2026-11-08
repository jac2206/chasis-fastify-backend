import { z } from "zod";

export const registerUserRequestSchema = z.object({
  documentType: z.enum(["CC", "CE", "NIT", "PT"]),
  documentNumber: z.string().min(5),
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: z.string(),
});

export const registerUserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  message: z.string(),
});

export const loginUserRequestSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const loginUserResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int().positive(),
  refreshExpiresIn: z.number().int().positive(),
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const refreshTokenResponseSchema = loginUserResponseSchema;

export const meUserResponseSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
});

export const getUsersResponseSchema = z.object({
  documentType: z.string(),
  documentNumber: z.string(),
  fullName: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  hasPin: z.boolean(),
  status: z.boolean(),
});
