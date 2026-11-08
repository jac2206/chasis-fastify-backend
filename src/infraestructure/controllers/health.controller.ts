import type { FastifyPluginAsyncZod } from "@fastify/type-provider-zod";
import { sharedErrorResponses } from "../schemas/error.schema";
import { healthSchema } from "../schemas/health.schema";

const healthController: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        response: { ...sharedErrorResponses, 200: healthSchema },
      },
    },
    async (_request, reply) => {
      const result = { status: "ok", service: "chasis-fastify-back" } as const;
      return reply.status(200).send(result);
    },
  );
};

export default healthController;
