import { PokemonBasicInfo } from "../../adapters/poke-api.adapter.interface";

export interface IGetPokemonXNameUseCase {
  execute(name: string): Promise<PokemonBasicInfo>;
}
