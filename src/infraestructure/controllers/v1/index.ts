import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import authController from "./auth.controller";
import genericController from "./generic.controller";
import usersController from "./users.controller";

const v1Controllers: FastifyPluginAsyncZod = async (app) => {
  await app.register(authController, { prefix: "/auth" });
  await app.register(genericController, { prefix: "/generic" });
  await app.register(usersController, { prefix: "/users" });
};

export default v1Controllers;
