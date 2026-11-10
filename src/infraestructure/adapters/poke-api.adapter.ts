import { DomainErrors } from "../../domain/errors/domain-errors";
import { DomainException } from "../../domain/exceptions/domain.exception";
import type {
  IPokeApiAdapter,
  PokemonBasicInfo,
} from "../../domain/interfaces/adapters/poke-api.adapter.interface";
import type { IHttpClient } from "../../domain/interfaces/http/http-client.interface";

export class PokeApiAdapter implements IPokeApiAdapter {
  constructor(private readonly httpClient: IHttpClient) {}

  async getPokemon(name: string): Promise<PokemonBasicInfo> {
    try {
      const response = await this.httpClient.request<PokemonBasicInfo>({
        method: "GET",
        path: "https://pokeapi.co/api/v2/pokemon/:name",
        pathParams: { name },
        timeoutMs: 4000,
      });
      return {
        name: response.data.name,
        height: response.data.height,
        weight: response.data.weight,
      };
    } catch {
      const error = DomainErrors.POKEMON_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
  }
}
