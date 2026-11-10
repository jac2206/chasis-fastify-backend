import bcrypt from "bcrypt";
import { User } from "../../../domain/entities/user.entity";
import { DomainErrors } from "../../../domain/errors/domain-errors";
import { DomainException } from "../../../domain/exceptions/domain.exception";
import type { IUserRepository } from "../../../domain/interfaces/repositories/user.repository.interface";
import type {
  RegisterUserRequestDTO,
  RegisterUserResponseDTO,
} from "../../dto/register-user.dto";
import type { IRegisterUserUseCase } from "../../interfaces/users/register-user.usecase.interface";

export class RegisterUserUseCase implements IRegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO> {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

    if (!passwordRegex.test(data.password)) {
      const error = DomainErrors.USER_WEAK_PASSWORD;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      const error = DomainErrors.USER_EMAIL_ALREADY_EXISTS;
      throw new DomainException(error.code, error.message, error.statusCode);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = new User(
      data.documentType,
      data.documentNumber,
      data.fullName,
      data.email,
      data.phone ?? null,
      passwordHash,
    );

    const savedUser = await this.userRepository.save(user);

    const response: RegisterUserResponseDTO = {
      id: savedUser.documentNumber,
      email: savedUser.email,
      fullName: savedUser.fullName,
      message: "User registered successfully",
    };

    return response;
  }
}
