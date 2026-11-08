import { asClass, createContainer, InjectionMode } from "awilix";
import { ClientCredentialsUseCase } from "../application/use-cases/auth/client-credentials.usecase";
import { ManageServiceClientUseCase } from "../application/use-cases/auth/manage-service-client.usecase";
import { CreateGenericUseCase } from "../application/use-cases/generic/create-generic.usecase";
import { GetGenericUseCase } from "../application/use-cases/generic/get-generic.usecase";
import { GetPokemonXNameUseCase } from "../application/use-cases/generic/get-pokemonxname.usecase";
import { GetXIdGenericUseCase } from "../application/use-cases/generic/getxid-generic.usecase";
import { UpdateGenericUseCase } from "../application/use-cases/generic/update-generic.usecase";
import { GetAllUsersUseCase } from "../application/use-cases/users/get-all-users.usecase";
import { GetMeUseCase } from "../application/use-cases/users/get-me-user.usecase";
import { LoginUserUseCase } from "../application/use-cases/users/login-user.usecase";
import { RefreshTokenUseCase } from "../application/use-cases/users/refresh-token.usecase";
import { RegisterUserUseCase } from "../application/use-cases/users/register-user.usecase";
import { PokeApiAdapter } from "../infraestructure/adapters/poke-api.adapter";
import { GenericRepository } from "../infraestructure/database/repositories/generic.repository";
import { ServiceClientPrismaRepository } from "../infraestructure/database/repositories/service-client-prisma.repository";
import { UserPrismaRepository } from "../infraestructure/database/repositories/user-prisma.repository";
import { HttpClient } from "../infraestructure/http/http-client";
import { WinstonLogger } from "../infraestructure/logger/wiston.logger";
import { JwtAuthService } from "../infraestructure/security/jwt-auth.service";

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  // Use cases
  getGenericUseCase: asClass(GetGenericUseCase).scoped(),
  createGenericUseCase: asClass(CreateGenericUseCase).scoped(),
  updateGenericUseCase: asClass(UpdateGenericUseCase).scoped(),
  getXIdGenericUseCase: asClass(GetXIdGenericUseCase).scoped(),
  getPokemonXNameUseCase: asClass(GetPokemonXNameUseCase).scoped(),
  loginUserUseCase: asClass(LoginUserUseCase).scoped(),
  registerUserUseCase: asClass(RegisterUserUseCase).scoped(),
  getMeUseCase: asClass(GetMeUseCase).scoped(),
  getAllUsersUseCase: asClass(GetAllUsersUseCase).scoped(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).scoped(),
  clientCredentialsUseCase: asClass(ClientCredentialsUseCase).scoped(),
  manageServiceClientUseCase: asClass(ManageServiceClientUseCase).scoped(),

  // Services
  authService: asClass(JwtAuthService).singleton(),

  // Adapter
  pokeApiAdapter: asClass(PokeApiAdapter).singleton(),

  httpClient: asClass(HttpClient).singleton(),
});

container.register({
  logger: asClass(WinstonLogger).singleton(),
});

container.register({
  genericRepository: asClass(GenericRepository).scoped(),
  // userRepository: asClass(UserRepository).scoped(),
  userRepository: asClass(UserPrismaRepository).scoped(),
  serviceClientRepository: asClass(ServiceClientPrismaRepository).scoped(),
});
