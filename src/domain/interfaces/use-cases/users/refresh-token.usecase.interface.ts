import type {
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
} from "../../../../application/dto/refresh-token.dto";

export interface IRefreshTokenUseCase {
  execute(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO>;
}
