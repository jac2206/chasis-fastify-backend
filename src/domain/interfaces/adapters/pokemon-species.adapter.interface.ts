export interface PokemonSpecies {
  id: number;
  name: string;
}

export interface IPokemonSpeciesAdapter {
  getSpecies(name: string): Promise<PokemonSpecies>;
}
