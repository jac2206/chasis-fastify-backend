import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IServiceClientRepository } from "../../../domain/interfaces/repositories/service-client.repository.interface";
import type { IPasswordHasher } from "../../../domain/interfaces/security/password-hasher.interface";
import type { ITokenDurations } from "../../../domain/interfaces/security/token-durations.interface";
import type { IAuthService } from "../../../domain/interfaces/services/auth.service.interface";
import type {
  ClientCredentialsRequestDTO,
  ClientCredentialsResponseDTO,
} from "../../dto/client-credentials.dto";
import type { IClientCredentialsUseCase } from "../../interfaces/auth/client-credentials.usecase.interface";

export class ClientCredentialsUseCase implements IClientCredentialsUseCase {
  constructor(
    private readonly serviceClientRepository: IServiceClientRepository,
    private readonly authService: IAuthService,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenDurations: ITokenDurations,
  ) {}

  async execute(
    data: ClientCredentialsRequestDTO,
  ): Promise<ClientCredentialsResponseDTO> {
    const client = await this.serviceClientRepository.findByClientId(data.clientId);
    const validSecret = client
      ? await this.passwordHasher.compare(data.clientSecret, client.clientSecretHash)
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
      expiresIn: this.tokenDurations.accessSeconds,
    };
  }
}
