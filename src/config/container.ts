import { asClass, createContainer, InjectionMode } from "awilix";
import { ClientCredentialsUseCase } from "../application/use-cases/auth/client-credentials.usecase";
import { ManageServiceClientUseCase } from "../application/use-cases/auth/manage-service-client.usecase";
import { GetPokemonXNameUseCase } from "../application/use-cases/generic/get-pokemonxname.usecase";
import { GetAllUsersUseCase } from "../application/use-cases/users/get-all-users.usecase";
import { GetMeUseCase } from "../application/use-cases/users/get-me-user.usecase";
import { LoginUserUseCase } from "../application/use-cases/users/login-user.usecase";
import { RefreshTokenUseCase } from "../application/use-cases/users/refresh-token.usecase";
import { RegisterUserUseCase } from "../application/use-cases/users/register-user.usecase";
import { PokeApiAdapter } from "../infraestructure/adapters/poke-api.adapter";
import { RefreshTokenRepository } from "../infraestructure/database/repositories/refresh-token.repository";
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
  loginUserUseCase: asClass(LoginUserUseCase).scoped(),
  registerUserUseCase: asClass(RegisterUserUseCase).scoped(),
  getMeUseCase: asClass(GetMeUseCase).scoped(),
  getAllUsersUseCase: asClass(GetAllUsersUseCase).scoped(),
  refreshTokenUseCase: asClass(RefreshTokenUseCase).scoped(),
  clientCredentialsUseCase: asClass(ClientCredentialsUseCase).scoped(),
  manageServiceClientUseCase: asClass(ManageServiceClientUseCase).scoped(),
  getPokemonXNameUseCase: asClass(GetPokemonXNameUseCase).scoped(),

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
  // userRepository: asClass(UserRepository).scoped(),
  userRepository: asClass(UserPrismaRepository).scoped(),
  serviceClientRepository: asClass(ServiceClientPrismaRepository).scoped(),
  refreshTokenRepository: asClass(RefreshTokenRepository).scoped(),
});
