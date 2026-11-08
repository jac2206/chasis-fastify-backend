import jwt, { SignOptions } from "jsonwebtoken";
import { IAuthService } from "../../domain/interfaces/services/auth.service.interface";
import { JwtPayload } from "../../domain/interfaces/security/jwt-payload.interface";
import { env } from "../../config/env";

export class JwtAuthService implements IAuthService {
  constructor() {}

  generateToken(payload: JwtPayload): string {
    const token = jwt.sign(payload, env.jwtSecret, {
      algorithm: "HS256",
      expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
    });

    return token;
  }

  generateRefreshToken(payload: Omit<JwtPayload, "type">): string {
    return jwt.sign({ ...payload, type: "refresh" }, env.jwtSecret, {
      algorithm: "HS256",
      expiresIn: env.jwtRefreshExpiresIn as SignOptions["expiresIn"],
    });
  }

  verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (decoded.type !== "access") {
      throw new Error("Invalid token type");
    }

    return decoded;
  }

  verifyRefreshToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (decoded.type !== "refresh") {
      throw new Error("Invalid refresh token type");
    }

    return decoded;
  }
}
