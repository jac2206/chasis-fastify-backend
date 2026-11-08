import {
  RegisterUserRequestDTO,
  RegisterUserResponseDTO,
} from "../../../../application/dto/register-user.dto";

export interface IRegisterUserUseCase {
  execute(data: RegisterUserRequestDTO): Promise<RegisterUserResponseDTO>;
}
