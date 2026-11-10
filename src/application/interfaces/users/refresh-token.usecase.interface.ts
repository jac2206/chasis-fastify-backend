import type {
  RefreshTokenRequestDTO,
  RefreshTokenResponseDTO,
} from "../../dto/refresh-token.dto";

export interface IRefreshTokenUseCase {
  execute(data: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO>;
}
