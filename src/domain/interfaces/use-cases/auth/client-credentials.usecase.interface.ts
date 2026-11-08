import type {
  ClientCredentialsRequestDTO,
  ClientCredentialsResponseDTO,
} from "../../../../application/dto/client-credentials.dto";

export interface IClientCredentialsUseCase {
  execute(data: ClientCredentialsRequestDTO): Promise<ClientCredentialsResponseDTO>;
}
