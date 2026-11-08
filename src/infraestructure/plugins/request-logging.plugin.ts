import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { logger } from "../logger/logger";

const requestLogging: FastifyPluginAsync = async (app) => {
  app.addHook("onResponse", async (request, reply) => {
    logger.info({
      event: "http_request_completed",
      method: request.method,
      route: request.routeOptions.url,
      statusCode: reply.statusCode,
      responseTimeMs: Math.round(reply.elapsedTime),
    });
  });
};

export const requestLoggingPlugin = fastifyPlugin(requestLogging, {
  name: "request-logging",
});
