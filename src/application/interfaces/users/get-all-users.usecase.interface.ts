import type { GetUsersResponseDTO } from "../../dto/get-users.dto";

export interface IGetAllUsersUseCase {
  execute(
    page: number,
    pageSize: number,
  ): Promise<{
    items: GetUsersResponseDTO[];
    page: number;
    pageSize: number;
    total: number;
  }>;
}
