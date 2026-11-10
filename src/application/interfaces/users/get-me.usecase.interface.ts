import type { GetMeResponseDTO } from "../../dto/me-user.dto";

export interface IGetMeUseCase {
  execute(userId: string): Promise<GetMeResponseDTO>;
}
