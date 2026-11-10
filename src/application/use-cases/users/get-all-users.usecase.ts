import type { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import type { GetUsersResponseDTO } from "../../dto/get-users.dto";
import type { IGetAllUsersUseCase } from "../../interfaces/users/get-all-users.usecase.interface";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    page: number,
    pageSize: number,
  ): Promise<{
    items: GetUsersResponseDTO[];
    page: number;
    pageSize: number;
    total: number;
  }> {
    const { users, total } = await this.userRepository.findPage(page, pageSize);
    const result = users.map((u) => ({
      documentType: u.documentType,
      documentNumber: u.documentNumber,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      hasPin: u.hasPin,
      status: u.status,
    }));

    return { items: result, page, pageSize, total };
  }
}
