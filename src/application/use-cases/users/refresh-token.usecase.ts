import { env } from "../../../config/env";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IRefreshTokenRepository } from "../../../domain/interfaces/repositories/refresh-token.repository.interface";
import type { IServiceClientRepository } from "../../../domain/interfaces/repositories/service-client.repository.interface";
import type { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import type { JwtPayload } from "../../../domain/interfaces/security/jwt-payload.interface";
import type { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";
import type {
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
} from "../../dto/refresh-token.dto";
import type { IRefreshTokenUseCase } from "../../interfaces/users/refresh-token.usecase.interface";

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly serviceClientRepository: IServiceClientRepository,
  ) {}

  async execute(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    let payload: JwtPayload;

    try {
      payload = this.authService.verifyRefreshToken(data.refreshToken);
    } catch {
      const error = DomainErrors.USER_INVALID_REFRESH_TOKEN;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const identity = payload.client_id
      ? await this.serviceClientRepository.findByClientId(payload.client_id)
      : await this.userRepository.findByDocument(payload.sub);
    if (!identity?.status) {
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

    const refreshToken = this.authService.generateRefreshToken(tokenPayload);
    const rotated = await this.refreshTokenRepository.rotate(
      data.refreshToken,
      refreshToken,
      new Date(Date.now() + durationInSeconds(env.jwtRefreshExpiresIn) * 1000),
    );
    if (!rotated) {
      const error = DomainErrors.USER_INVALID_REFRESH_TOKEN;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    return {
      token: this.authService.generateToken({ ...tokenPayload, type: "access" }),
      refreshToken,
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
