import bcrypt from "bcrypt";
import { env } from "../../../config/env";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IServiceClientRepository } from "../../../domain/interfaces/repositories/service-client.repository.interface";
import type { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";
import type { IClientCredentialsUseCase } from "../../../domain/interfaces/use-cases/auth/client-credentials.usecase.interface";
import type {
  ClientCredentialsRequestDTO,
  ClientCredentialsResponseDTO,
} from "../../dto/client-credentials.dto";

export class ClientCredentialsUseCase implements IClientCredentialsUseCase {
  constructor(
    private readonly serviceClientRepository: IServiceClientRepository,
    private readonly authService: IAuthService,
  ) {}

  async execute(
    data: ClientCredentialsRequestDTO,
  ): Promise<ClientCredentialsResponseDTO> {
    const client = await this.serviceClientRepository.findByClientId(data.clientId);
    const validSecret = client
      ? await bcrypt.compare(data.clientSecret, client.clientSecretHash)
      : false;

    if (!client?.status || !validSecret) {
      const error = DomainErrors.INVALID_CLIENT_CREDENTIALS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    return {
      token: this.authService.generateToken({
        sub: client.clientId,
        client_id: client.clientId,
        scopes: client.scopes,
        type: "access",
      }),
      tokenType: "Bearer",
      expiresIn: durationInSeconds(env.jwtAccessExpiresIn),
    };
  }
}

const durationInSeconds = (duration: string): number => {
  const match = /^(\d+)([smhd])$/.exec(duration);

  if (!match) return 0;

  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return Number(match[1]) * multipliers[match[2]];
};
