import {
  LoginUserRequestDTO,
  LoginUserResponseDTO,
} from "../../../../application/dto/login-user.dto";

export interface ILoginUserUseCase {
  execute(data: LoginUserRequestDTO): Promise<LoginUserResponseDTO>;
}
