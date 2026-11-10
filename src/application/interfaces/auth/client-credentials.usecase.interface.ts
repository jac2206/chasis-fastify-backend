import type {
  ClientCredentialsRequestDTO,
  ClientCredentialsResponseDTO,
} from "../../dto/client-credentials.dto";

export interface IClientCredentialsUseCase {
  execute(data: ClientCredentialsRequestDTO): Promise<ClientCredentialsResponseDTO>;
}
