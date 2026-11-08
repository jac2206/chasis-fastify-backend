import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import type { ClientCredentialsUseCase } from "../../../application/use-cases/auth/client-credentials.usecase";
import type { ManageServiceClientUseCase } from "../../../application/use-cases/auth/manage-service-client.usecase";
import type { LoginUserUseCase } from "../../../application/use-cases/users/login-user.usecase";
import type { RefreshTokenUseCase } from "../../../application/use-cases/users/refresh-token.usecase";
import { authenticateJWT, authorizeScopes } from "../../hooks/auth.hook";
import {
  clientCredentialsRequestSchema,
  clientCredentialsResponseSchema,
  createServiceClientRequestSchema,
  createServiceClientResponseSchema,
  rotateServiceClientResponseSchema,
  serviceClientParamsSchema,
  serviceClientStatusResponseSchema,
} from "../../schemas/auth.schema";
import { sharedErrorResponses } from "../../schemas/error.schema";
import {
  loginUserRequestSchema,
  loginUserResponseSchema,
  refreshTokenRequestSchema,
  refreshTokenResponseSchema,
} from "../../schemas/user.schema";

const authController: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        body: loginUserRequestSchema,
        response: { ...sharedErrorResponses, 200: loginUserResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<LoginUserUseCase>("loginUserUseCase");
      const result = await useCase.execute(request.body);
      return reply.status(200).send(result);
    },
  );

  app.post(
    "/service-clients",
    {
      preHandler: [authenticateJWT, authorizeScopes(["service-clients:manage"])],
      schema: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        body: createServiceClientRequestSchema,
        response: { ...sharedErrorResponses, 201: createServiceClientResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase = request.scopedContainer.resolve<ManageServiceClientUseCase>(
        "manageServiceClientUseCase",
      );
      const result = await useCase.create(request.body);
      return reply.status(201).send(result);
    },
  );

  app.post(
    "/service-clients/:clientId/rotate-secret",
    {
      preHandler: [authenticateJWT, authorizeScopes(["service-clients:manage"])],
      schema: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        params: serviceClientParamsSchema,
        response: { ...sharedErrorResponses, 200: rotateServiceClientResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase = request.scopedContainer.resolve<ManageServiceClientUseCase>(
        "manageServiceClientUseCase",
      );
      const result = await useCase.rotateSecret(request.params.clientId);
      return reply.status(200).send(result);
    },
  );

  app.patch(
    "/service-clients/:clientId/disable",
    {
      preHandler: [authenticateJWT, authorizeScopes(["service-clients:manage"])],
      schema: {
        tags: ["Auth"],
        security: [{ bearerAuth: [] }],
        params: serviceClientParamsSchema,
        response: { ...sharedErrorResponses, 200: serviceClientStatusResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase = request.scopedContainer.resolve<ManageServiceClientUseCase>(
        "manageServiceClientUseCase",
      );
      const result = await useCase.disable(request.params.clientId);
      return reply.status(200).send(result);
    },
  );

  app.post(
    "/refresh",
    {
      schema: {
        tags: ["Auth"],
        body: refreshTokenRequestSchema,
        response: { ...sharedErrorResponses, 200: refreshTokenResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<RefreshTokenUseCase>("refreshTokenUseCase");
      const result = await useCase.execute(request.body);
      return reply.status(200).send(result);
    },
  );

  app.post(
    "/client-credentials",
    {
      schema: {
        tags: ["Auth"],
        body: clientCredentialsRequestSchema,
        response: { ...sharedErrorResponses, 200: clientCredentialsResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase = request.scopedContainer.resolve<ClientCredentialsUseCase>(
        "clientCredentialsUseCase",
      );
      const result = await useCase.execute(request.body);
      return reply.status(200).send(result);
    },
  );
};

export default authController;
