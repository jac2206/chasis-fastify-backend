import {
  IPokeApiAdapter,
  PokemonBasicInfo,
} from "../../../domain/interfaces/adapters/poke-api.adapter.interface";
import { ILogger } from "../../../domain/interfaces/logger.interface";
import { IGetPokemonXNameUseCase } from "../../../domain/interfaces/use-cases/generic/get-pokemonxname.usecase.interface";

export class GetPokemonXNameUseCase implements IGetPokemonXNameUseCase {
  constructor(
    private readonly logger: ILogger,
    private readonly pokeApiAdapter: IPokeApiAdapter,
  ) {}

  async execute(name: string): Promise<PokemonBasicInfo> {
    const result = await this.pokeApiAdapter.getPokemon(name);
    this.logger.info("GetPokemonXNamecUseCase", "Response ExternalApi", result);
    return result;
  }
}
