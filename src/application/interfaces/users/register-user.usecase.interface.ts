import type {
  RegisterUserRequestDTO,
  RegisterUserResponseDTO,
} from "../../dto/register-user.dto";

export interface IRegisterUserUseCase {
  execute(data: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO>;
}
