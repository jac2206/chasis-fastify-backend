import { hasZodFastifySchemaValidationErrors } from "@fastify/type-provider-zod";
import type { FastifyInstance } from "fastify";
import { DomainException } from "../../domain/exceptions/domain.exception";
import { logger } from "../logger/logger";

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error, _request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(422).send({
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        errors: error.validation,
      });
    }

    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "FST_ERR_CTP_INVALID_JSON_BODY"
    ) {
      logger.warn({ code: "INVALID_JSON", message: "Invalid JSON body" });
      return reply.status(400).send({
        code: "INVALID_JSON",
        message: "Invalid JSON body",
      });
    }

    if (error instanceof DomainException) {
      logger.warn({ code: error.code, message: error.message });
      return reply.status(error.statusCode).send({
        code: error.code,
        message: error.message,
      });
    }

    logger.error({
      event: "http_request_failed",
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorCode: error instanceof Error && "code" in error ? error.code : undefined,
    });

    return reply.status(500).send({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
  });
};
