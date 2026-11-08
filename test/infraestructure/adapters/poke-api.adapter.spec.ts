import { describe, it, expect, vi, beforeEach } from "vitest";
import { PokeApiAdapter } from "../../../src/infraestructure/adapters/poke-api.adapter";
import { ILogger } from "../../../src/domain/interfaces/logger.interface";
import { IHttpClient } from "../../../src/domain/interfaces/http/http-client.interface";
import { DomainException } from "../../../src/domain/exceptions/domain.exception";
import { DomainErrors } from "../../../src/domain/errors/domain-errors";

describe("PokeApiAdapter", () => {
  let loggerMock: ILogger;
  let httpClientMock: IHttpClient;
  let adapter: PokeApiAdapter;

  beforeEach(() => {
    loggerMock = {
      info: vi.fn(),
      error: vi.fn?.(),
    } as unknown as ILogger;

    httpClientMock = {
      request: vi.fn(),
    };

    adapter = new PokeApiAdapter(loggerMock, httpClientMock);
  });

  it("should return mapped pokemon data when api responds successfully", async () => {
    const pokemonName = "pikachu";

    const fakeApiResponse = {
      data: {
        name: "pikachu",
        height: 4,
        weight: 60,
      },
    };

    (httpClientMock.request as any).mockResolvedValue(fakeApiResponse);

    const result = await adapter.getPokemon(pokemonName);

    expect(httpClientMock.request).toHaveBeenCalledWith({
      method: "GET",
      path: "https://pokeapi.co/api/v2/pokemon/:name",
      pathParams: { name: pokemonName },
      timeoutMs: 4000,
    });

    expect(result).toEqual({
      name: "pikachu",
      height: 4,
      weight: 60,
    });
  });

  it("should throw DomainException when api returns 404", async () => {
    const pokemonName = "unknown";

    const fakeError = {
      response: {
        status: 404,
      },
    };

    (httpClientMock.request as any).mockRejectedValue(fakeError);

    await expect(adapter.getPokemon(pokemonName)).rejects.toBeInstanceOf(
      DomainException,
    );

    try {
      await adapter.getPokemon(pokemonName);
    } catch (error: any) {
      const expectedError = DomainErrors.POKEMON_NOT_FOUND;
      expect(error.code).toBe(expectedError.code);
      expect(error.message).toBe(expectedError.message);
      expect(error.statusCode).toBe(expectedError.statusCode);
    }
  });

  it("should throw DomainException when api returns other error", async () => {
    const pokemonName = "mewtwo";

    const fakeError = new Error("Internal error");

    (httpClientMock.request as any).mockRejectedValue(fakeError);

    await expect(adapter.getPokemon(pokemonName)).rejects.toBeInstanceOf(
      DomainException,
    );

    try {
      await adapter.getPokemon(pokemonName);
    } catch (error: any) {
      const expectedError = DomainErrors.POKEMON_NOT_FOUND;
      expect(error.code).toBe(expectedError.code);
      expect(error.message).toBe(expectedError.message);
      expect(error.statusCode).toBe(expectedError.statusCode);
    }
  });
});
