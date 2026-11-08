import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import type { CreateGenericUseCase } from "../../../application/use-cases/generic/create-generic.usecase";
import type { GetGenericUseCase } from "../../../application/use-cases/generic/get-generic.usecase";
import type { GetPokemonXNameUseCase } from "../../../application/use-cases/generic/get-pokemonxname.usecase";
import type { GetXIdGenericUseCase } from "../../../application/use-cases/generic/getxid-generic.usecase";
import type { UpdateGenericUseCase } from "../../../application/use-cases/generic/update-generic.usecase";
import { authenticateJWT, authorizeScopes } from "../../hooks/auth.hook";
import { sharedErrorResponses } from "../../schemas/error.schema";
import {
  genericParamsSchema,
  genericRequestSchema,
  genericResponseSchema,
  pokemonParamsSchema,
  pokemonResponseSchema,
  updateGenericResponseSchema,
} from "../../schemas/generic.schema";

const genericController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [authenticateJWT, authorizeScopes(["generic"])],
      schema: {
        tags: ["Generic"],
        security: [{ bearerAuth: [] }],
        response: { ...sharedErrorResponses, 200: genericResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<GetGenericUseCase>("getGenericUseCase");
      const result = await useCase.execute();
      return reply.status(200).send(result);
    },
  );

  app.post(
    "/",
    {
      schema: {
        tags: ["Generic"],
        body: genericRequestSchema,
        response: { ...sharedErrorResponses, 200: genericResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<CreateGenericUseCase>("createGenericUseCase");
      const result = await useCase.execute(request.body);
      return reply.status(200).send(result);
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
      const result = await useCase.execute(request.params.name);
      return reply.status(200).send(result);
    },
  );

  app.get(
    "/:id",
    {
      schema: {
        tags: ["Generic"],
        params: genericParamsSchema,
        response: { ...sharedErrorResponses, 200: genericResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<GetXIdGenericUseCase>("getXIdGenericUseCase");
      const result = (await useCase.execute(request.params.id)) ?? {};
      return reply.status(200).send(result);
    },
  );

  app.patch(
    "/:id",
    {
      schema: {
        tags: ["Generic"],
        params: genericParamsSchema,
        body: genericRequestSchema,
        response: { ...sharedErrorResponses, 200: updateGenericResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<UpdateGenericUseCase>("updateGenericUseCase");
      const result = {
        message: "PATCH request received",
        result: await useCase.execute(request.body, request.params.id),
      };
      return reply.status(200).send(result);
    },
  );
};

export default genericController;
