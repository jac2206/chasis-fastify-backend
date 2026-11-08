import {
  CreateServiceClientRequestDTO,
  CreateServiceClientResponseDTO,
  RotateServiceClientResponseDTO,
  ServiceClientStatusResponseDTO,
} from "../../../../application/dto/service-client.dto";

export interface IManageServiceClientUseCase {
  create(data: CreateServiceClientRequestDTO): Promise<CreateServiceClientResponseDTO>;
  rotateSecret(clientId: string): Promise<RotateServiceClientResponseDTO>;
  disable(clientId: string): Promise<ServiceClientStatusResponseDTO>;
}
