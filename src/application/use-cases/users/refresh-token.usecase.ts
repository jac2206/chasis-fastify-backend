import { env } from "../../../config/env";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { JwtPayload } from "../../../domain/interfaces/security/jwt-payload.interface";
import type { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";
import type { IRefreshTokenUseCase } from "../../../domain/interfaces/use-cases/users/refresh-token.usecase.interface";
import type {
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
} from "../../dto/refresh-token.dto";

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    let payload: JwtPayload;

    try {
      payload = this.authService.verifyRefreshToken(data.refreshToken);
    } catch {
      const error = DomainErrors.USER_INVALID_REFRESH_TOKEN;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const tokenPayload = {
      sub: payload.sub,
      ...(payload.email && { email: payload.email }),
      ...(payload.username && { username: payload.username }),
      ...(payload.client_id && { client_id: payload.client_id }),
      ...(payload.scopes && { scopes: payload.scopes }),
    };

    return {
      token: this.authService.generateToken({ ...tokenPayload, type: "access" }),
      refreshToken: this.authService.generateRefreshToken(tokenPayload),
      tokenType: "Bearer",
      expiresIn: durationInSeconds(env.jwtAccessExpiresIn),
      refreshExpiresIn: durationInSeconds(env.jwtRefreshExpiresIn),
    };
  }
}

const durationInSeconds = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration);

  if (!match) {
    return 0;
  }

  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return Number(match[1]) * multipliers[match[2]];
};
