import { GetMeResponseDTO } from "../../../../application/dto/me-user.dto";

export interface IGetMeUseCase {
  execute(userId: string): Promise<GetMeResponseDTO>;
}
