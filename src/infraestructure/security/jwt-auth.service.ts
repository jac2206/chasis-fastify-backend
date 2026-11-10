import { randomUUID } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import type { JwtPayload } from "../../domain/interfaces/security/jwt-payload.interface";
import type { IAuthService } from "../../domain/interfaces/services/auth.service.interface";

export class JwtAuthService implements IAuthService {
  constructor() {}

  generateToken(payload: JwtPayload): string {
    const token = jwt.sign(payload, this.getJwtSecret(), {
      algorithm: "HS256",
      expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
    });

    return token;
  }

  generateRefreshToken(payload: Omit<JwtPayload, "type">): string {
    return jwt.sign({ ...payload, type: "refresh" }, this.getJwtSecret(), {
      algorithm: "HS256",
      jwtid: randomUUID(),
      expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
    });
  }

  verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.getJwtSecret(), {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  }

  verifyRefreshToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.getJwtSecret(), {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (decoded.type !== "refresh") {
      throw new Error("Invalid refresh token type");
    }

    return decoded;
  }

  private getJwtSecret(): string {
    if (!env.jwtSecret?.trim()) {
      throw new Error("JWT_SECRET is required");
    }

    return env.jwtSecret;
  }
}
