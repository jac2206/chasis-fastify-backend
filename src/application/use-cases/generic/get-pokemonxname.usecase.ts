import type {
  IPokeApiAdapter,
  PokemonBasicInfo,
} from "../../../domain/interfaces/adapters/poke-api.adapter.interface";

export class GetPokemonXNameUseCase {
  constructor(private readonly pokeApiAdapter: IPokeApiAdapter) {}

  async execute(name: string): Promise<PokemonBasicInfo> {
    return this.pokeApiAdapter.getPokemon(name);
  }
}
