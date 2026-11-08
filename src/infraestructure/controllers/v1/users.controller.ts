import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import type { GetAllUsersUseCase } from "../../../application/use-cases/users/get-all-users.usecase";
import type { GetMeUseCase } from "../../../application/use-cases/users/get-me-user.usecase";
import type { RegisterUserUseCase } from "../../../application/use-cases/users/register-user.usecase";
import { authenticateJWT, authorizeScopes } from "../../hooks/auth.hook";
import { sharedErrorResponses } from "../../schemas/error.schema";
import {
  getUsersResponseSchema,
  meUserResponseSchema,
  registerUserRequestSchema,
  registerUserResponseSchema,
} from "../../schemas/user.schema";

const usersController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/",
    {
      preHandler: [authenticateJWT, authorizeScopes(["user"])],
      schema: {
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        response: { ...sharedErrorResponses, 200: getUsersResponseSchema.array() },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<GetAllUsersUseCase>("getAllUsersUseCase");
      const result = await useCase.execute();
      return reply.status(200).send(result);
    },
  );

  app.post(
    "/register",
    {
      schema: {
        tags: ["Users"],
        body: registerUserRequestSchema,
        response: { ...sharedErrorResponses, 201: registerUserResponseSchema },
      },
    },
    async (request, reply) => {
      const useCase =
        request.scopedContainer.resolve<RegisterUserUseCase>("registerUserUseCase");
      const result = await useCase.execute(request.body);
      return reply.status(201).send(result);
    },
  );

  app.get(
    "/me",
    {
      preHandler: [authenticateJWT, authorizeScopes(["user"])],
      schema: {
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        response: { ...sharedErrorResponses, 200: meUserResponseSchema },
      },
    },
    async (request, reply) => {
      const userId = request.user?.sub;

      if (!userId) {
        return reply
          .status(401)
          .send({ code: "UNAUTHORIZED", message: "Missing token" });
      }

      const useCase = request.scopedContainer.resolve<GetMeUseCase>("getMeUseCase");
      const result = await useCase.execute(userId);
      return reply.status(200).send(result);
    },
  );
};

export default usersController;
