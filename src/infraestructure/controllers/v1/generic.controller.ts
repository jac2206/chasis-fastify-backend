import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import type { GetPokemonXNameUseCase } from "../../../application/use-cases/generic/get-pokemonxname.usecase";
import { sharedErrorResponses } from "../../schemas/error.schema";
import {
  pokemonParamsSchema,
  pokemonResponseSchema,
} from "../../schemas/pokemon.schema";

const genericController: FastifyPluginAsyncZod = async (app) => {
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
