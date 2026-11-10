import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IRefreshTokenRepository } from "../../../domain/interfaces/repositories/refresh-token.repository.interface";
import type { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import type { IPasswordHasher } from "../../../domain/interfaces/security/password-hasher.interface";
import type { ITokenDurations } from "../../../domain/interfaces/security/token-durations.interface";
import type { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";
import type {
  LoginUserRequestDTO,
  LoginUserResponseDTO,
} from "../../dto/login-user.dto";
import type { ILoginUserUseCase } from "../../interfaces/users/login-user.usecase.interface";

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenDurations: ITokenDurations,
  ) {}

  async execute(data: LoginUserRequestDTO): Promise<LoginUserResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user?.status) {
      const error = DomainErrors.USER_INVALID_CREDENTIALS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const validPassword = await this.passwordHasher.compare(
      data.password,
      user.passwordHash,
    );

    if (!validPassword) {
      const error = DomainErrors.USER_INVALID_CREDENTIALS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const tokenPayload = {
      sub: user.documentNumber,
      email: user.email,
      scopes: ["user"],
    };

    const token = this.authService.generateToken({ ...tokenPayload, type: "access" });
    const refreshToken = this.authService.generateRefreshToken(tokenPayload);
    await this.refreshTokenRepository.create(
      refreshToken,
      new Date(Date.now() + this.tokenDurations.refreshSeconds * 1000),
    );

    const response: LoginUserResponseDTO = {
      token,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: this.tokenDurations.accessSeconds,
      refreshExpiresIn: this.tokenDurations.refreshSeconds,
    };

    return response;
  }
}
