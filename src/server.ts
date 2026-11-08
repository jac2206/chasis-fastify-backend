import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
  serializerCompiler,
  validatorCompiler,
} from "@fastify/type-provider-zod";
import fastify from "fastify";
import healthController from "./infraestructure/controllers/health.controller";
import v1Controllers from "./infraestructure/controllers/v1";
import { registerErrorHandler } from "./infraestructure/hooks/error.hook";
import { requestLoggingPlugin } from "./infraestructure/plugins/request-logging.plugin";
import { requestScopePlugin } from "./infraestructure/plugins/request-scope.plugin";

const API_PREFIX = "/chasis";
const API_V1_PREFIX = `${API_PREFIX}/v1`;
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4002",
  "https://loyalty-web-mocha.vercel.app",
];

export const createServer = () => {
  const app = fastify({ logger: false });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyCors, {
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
  });

  app.register(fastifySwagger, {
    openapi: {
      info: { title: "Chasis Fastify API", version: "1.0.0" },
      servers: [{ url: "http://localhost:3000" }],
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        },
      },
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });

  app.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: { persistAuthorization: true, displayRequestDuration: true },
  });

  app.register(requestScopePlugin);
  app.register(requestLoggingPlugin);
  app.register(healthController, { prefix: API_PREFIX });
  app.register(v1Controllers, { prefix: API_V1_PREFIX });

  app.setNotFoundHandler((_request, reply) => {
    return reply.status(404).send({ message: "Route not found", code: 404 });
  });

  registerErrorHandler(app);

  return app;
};
