import bcrypt from "bcrypt";
import { LoginUserRequestDTO, LoginUserResponseDTO } from "../../dto/login-user.dto";
import { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import { ILoginUserUseCase } from "../../../domain/interfaces/use-cases/users/login-user.usecase.interface";
import { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import { env } from "../../../config/env";

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(data: LoginUserRequestDTO): Promise<LoginUserResponseDTO> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      const error = DomainErrors.USER_INVALID_CREDENTIALS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);

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

    const response: LoginUserResponseDTO = {
      token,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: durationInSeconds(env.jwtAccessExpiresIn),
      refreshExpiresIn: durationInSeconds(env.jwtRefreshExpiresIn),
    };

    return response;
  }
}

const durationInSeconds = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration);

  if (!match) {
    return 0;
  }

  const value = Number(match[1]);
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[match[2]];
};
