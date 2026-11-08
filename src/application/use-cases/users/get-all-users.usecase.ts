import { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import { IGetAllUsersUseCase } from "../../../domain/interfaces/use-cases/users/get-all-users.usecase.interface";
import { GetUsersResponseDTO } from "../../dto/get-users.dto";

export class GetAllUsersUseCase implements IGetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<GetUsersResponseDTO[]> {
    const users = await this.userRepository.findAll();
    const result = users.map((u) => ({
      documentType: u.documentType,
      documentNumber: u.documentNumber,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      hasPin: u.hasPin,
      status: u.status,
    }));

    return result;
  }
}
