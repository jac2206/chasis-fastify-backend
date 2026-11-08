export interface PokemonBasicInfo {
  name: string;
  height: number;
  weight: number;
}

export interface IPokeApiAdapter {
  getPokemon(name: string): Promise<PokemonBasicInfo>;
}
