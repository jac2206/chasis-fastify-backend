import type { AwilixContainer } from "awilix";
import type { JwtPayload } from "../domain/interfaces/security/jwt-payload.interface";

declare module "fastify" {
  interface FastifyRequest {
    scopedContainer: AwilixContainer;
    user?: JwtPayload;
  }
}
