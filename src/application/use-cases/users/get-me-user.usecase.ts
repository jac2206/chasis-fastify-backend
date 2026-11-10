import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import type { GetMeResponseDTO } from "../../dto/me-user.dto";
import type { IGetMeUseCase } from "../../interfaces/users/get-me.usecase.interface";

export class GetMeUseCase implements IGetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<GetMeResponseDTO> {
    const user = await this.userRepository.findByDocument(userId);

    if (!user) {
      const error = DomainErrors.USER_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const result: GetMeResponseDTO = {
      documentNumber: user.documentNumber,
      documentType: user.documentType,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
    };

    return result;
  }
}
