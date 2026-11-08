import type { preHandlerHookHandler } from "fastify";
import type { IAuthService } from "../../domain/interfaces/services/auth.service.interface";

export const authenticateJWT: preHandlerHookHandler = async (request, reply) => {
  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    reply.status(401).send({
      code: "UNAUTHORIZED",
      message: "Missing token",
    });
    return;
  }

  try {
    const authService = request.scopedContainer.resolve<IAuthService>("authService");
    request.user = authService.verifyToken(authorization.slice("Bearer ".length));
  } catch {
    reply.status(401).send({
      code: "INVALID_TOKEN",
      message: "Token invalid or expired",
    });
    return;
  }
};

export const authorizeScopes = (requiredScopes: string[]): preHandlerHookHandler => {
  return async (request, reply) => {
    const scopes = request.user?.scopes;

    if (!scopes) {
      reply.status(403).send({
        code: "FORBIDDEN",
        message: "No scopes found",
      });
      return;
    }

    if (!requiredScopes.some((scope) => scopes.includes(scope))) {
      reply.status(403).send({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
      return;
    }
  };
};
