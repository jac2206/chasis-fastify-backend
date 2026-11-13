import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import type { GetPokemonSpeciesUseCase } from "../../../application/use-cases/generic/get-pokemon-species.usecase";
import type { GetPokemonXNameUseCase } from "../../../application/use-cases/generic/get-pokemonxname.usecase";
import { errorResponseSchema, sharedErrorResponses } from "../../schemas/error.schema";
import {
  pokemonParamsSchema,
  pokemonResponseSchema,
  pokemonSpeciesResponseSchema,
} from "../../schemas/pokemon.schema";

const genericController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/pokemon-species/:name",
    {
      schema: {
        tags: ["Generic"],
        params: pokemonParamsSchema,
        response: {
          ...sharedErrorResponses,
          404: errorResponseSchema,
          502: errorResponseSchema,
          200: pokemonSpeciesResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const useCase = request.scopedContainer.resolve<GetPokemonSpeciesUseCase>(
        "getPokemonSpeciesUseCase",
      );
      return reply.status(200).send(await useCase.execute(request.params.name));
    },
  );
  app.get(
    "/pokemon/:name",
    {
      schema: {
        tags: ["Generic"],
        params: pokemonParamsSchema,
        response: { ...sharedErrorResponses, 200: pokemonResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase = request.scopedContainer.resolve<GetPokemonXNameUseCase>(
        "getPokemonXNameUseCase",
      );
      return reply.status(200).send(await useCase.execute(request.params.name));
    },
  );
};

export default genericController;
