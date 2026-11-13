import type {
  IPokemonSpeciesAdapter,
  PokemonSpecies,
} from "../../../domain/interfaces/adapters/pokemon-species.adapter.interface";

export class GetPokemonSpeciesUseCase {
  constructor(private readonly pokemonSpeciesAdapter: IPokemonSpeciesAdapter) {}

  async execute(name: string): Promise<PokemonSpecies> {
    return this.pokemonSpeciesAdapter.getSpecies(name);
  }
}
