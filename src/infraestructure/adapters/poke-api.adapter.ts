import { DomainErrors } from "../../domain/errors/domain-errors";
import { DomainException } from "../../domain/exceptions/domain.exception";
import {
  IPokeApiAdapter,
  PokemonBasicInfo,
} from "../../domain/interfaces/adapters/poke-api.adapter.interface";
import { IHttpClient } from "../../domain/interfaces/http/http-client.interface";
import { ILogger } from "../../domain/interfaces/logger.interface";

export class PokeApiAdapter implements IPokeApiAdapter {
  constructor(
    private readonly logger: ILogger,
    private readonly httpClient: IHttpClient,
  ) {}

  async getPokemon(name: string): Promise<PokemonBasicInfo> {
    try {
      const responseApi = await this.httpClient.request<any>({
        method: "GET",
        path: "https://pokeapi.co/api/v2/pokemon/:name",
        pathParams: { name },
        timeoutMs: 4000,
      });

      const resultPokemon: PokemonBasicInfo = {
        name: responseApi.data.name,
        height: responseApi.data.height,
        weight: responseApi.data.weight,
      };

      return resultPokemon;
    } catch (errorApi: any) {
      if (errorApi.response?.status === 404) {
        const error = DomainErrors.POKEMON_NOT_FOUND;
        throw new DomainException(error.code, error.message, error.statusCode);
      }
      const error = DomainErrors.POKEMON_NOT_FOUND;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
  }
}
