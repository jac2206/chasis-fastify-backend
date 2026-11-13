import { DomainErrors } from "../../domain/errors/domain-errors";
import { DomainException } from "../../domain/exceptions/domain.exception";
import type {
  IPokemonSpeciesAdapter,
  PokemonSpecies,
} from "../../domain/interfaces/adapters/pokemon-species.adapter.interface";
import type { IHttpClient } from "../../domain/interfaces/http/http-client.interface";

export class PokemonSpeciesAdapter implements IPokemonSpeciesAdapter {
  constructor(private readonly httpClient: IHttpClient) {}

  async getSpecies(name: string): Promise<PokemonSpecies> {
    try {
      const response = await this.httpClient.request<PokemonSpecies>({
        method: "GET",
        path: "https://pokeapi.co/api/v2/pokemon-species/:name",
        pathParams: { name },
        timeoutMs: 4000,
      });
      return { id: response.data.id, name: response.data.name };
    } catch (cause: unknown) {
      const status =
        typeof cause === "object" &&
        cause !== null &&
        "response" in cause &&
        typeof cause.response === "object" &&
        cause.response !== null &&
        "status" in cause.response
          ? cause.response.status
          : undefined;
      const error =
        status === 404
          ? DomainErrors.POKEMON_SPECIES_NOT_FOUND
          : DomainErrors.API_EXTERNAL_ERROR;
      throw new DomainException(error.code, error.message, error.statusCode);
    }
  }
}
