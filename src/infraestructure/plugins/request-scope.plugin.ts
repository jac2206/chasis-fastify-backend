import type { AwilixContainer } from "awilix";
import type { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { container } from "../../config/container";

const requestScope: FastifyPluginAsync = async (app) => {
  app.decorateRequest("scopedContainer", null as unknown as AwilixContainer);

  app.addHook("onRequest", async (request) => {
    request.scopedContainer = container.createScope();
  });

  app.addHook("onResponse", async (request) => {
    await request.scopedContainer.dispose();
  });
};

export const requestScopePlugin = fastifyPlugin(requestScope, {
  name: "request-scope",
});
