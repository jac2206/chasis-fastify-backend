import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IRefreshTokenRepository } from "../../../domain/interfaces/repositories/refresh-token.repository.interface";
import type { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";

export class LogoutUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    try {
      this.authService.verifyRefreshToken(refreshToken);
    } catch {
      const error = DomainErrors.USER_INVALID_REFRESH_TOKEN;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
    await this.refreshTokenRepository.revoke(refreshToken);
  }
}
