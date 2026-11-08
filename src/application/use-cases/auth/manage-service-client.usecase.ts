import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import type {
  CreateServiceClientRequestDTO,
  CreateServiceClientResponseDTO,
  RotateServiceClientResponseDTO,
  ServiceClientStatusResponseDTO,
} from "../../dto/service-client.dto";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IServiceClientRepository } from "../../../domain/interfaces/repositories/service-client.repository.interface";
import type { IManageServiceClientUseCase } from "../../../domain/interfaces/use-cases/auth/manage-service-client.usecase.interface";

export class ManageServiceClientUseCase implements IManageServiceClientUseCase {
  constructor(private readonly serviceClientRepository: IServiceClientRepository) {}

  async create(
    data: CreateServiceClientRequestDTO,
  ): Promise<CreateServiceClientResponseDTO> {
    const existing = await this.serviceClientRepository.findByClientId(data.clientId);
    if (existing) {
      const error = DomainErrors.SERVICE_CLIENT_ALREADY_EXISTS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const clientSecret = generateSecret();
    await this.serviceClientRepository.create({
      clientId: data.clientId,
      clientSecretHash: await bcrypt.hash(clientSecret, 12),
      scopes: data.scopes,
    });

    return { clientId: data.clientId, clientSecret, scopes: data.scopes };
  }

  async rotateSecret(clientId: string): Promise<RotateServiceClientResponseDTO> {
    await this.ensureClient(clientId);
    const clientSecret = generateSecret();
    await this.serviceClientRepository.updateSecret(
      clientId,
      await bcrypt.hash(clientSecret, 12),
    );
    return { clientId, clientSecret };
  }

  async disable(clientId: string): Promise<ServiceClientStatusResponseDTO> {
    await this.ensureClient(clientId);
    await this.serviceClientRepository.updateStatus(clientId, false);
    return { clientId, status: false };
  }

  private async ensureClient(clientId: string): Promise<void> {
    const client = await this.serviceClientRepository.findByClientId(clientId);
    if (!client) {
      const error = DomainErrors.SERVICE_CLIENT_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
  }
}

const generateSecret = (): string => randomBytes(32).toString("base64url");
