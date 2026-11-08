import { GetUsersResponseDTO } from "../../../../application/dto/get-users.dto";

export interface IGetAllUsersUseCase {
  execute(): Promise<GetUsersResponseDTO[]>;
}
