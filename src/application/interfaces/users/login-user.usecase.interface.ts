import type {
  LoginUserRequestDTO,
  LoginUserResponseDTO,
} from "../../dto/login-user.dto";

export interface ILoginUserUseCase {
  execute(data: LoginUserRequestDTO): Promise<LoginUserResponseDTO>;
}
