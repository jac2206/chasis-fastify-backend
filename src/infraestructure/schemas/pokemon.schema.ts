import { z } from "zod";

export const pokemonParamsSchema = z.object({ name: z.string().min(1) });
export const pokemonSpeciesResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});
export const pokemonResponseSchema = z.object({
  name: z.string(),
  height: z.number(),
  weight: z.number(),
});
