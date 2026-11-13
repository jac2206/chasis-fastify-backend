import { describe, expect, it, vi } from "vitest";
import type { IHttpClient } from "../../../src/domain/interfaces/http/http-client.interface";
import { PokemonSpeciesAdapter } from "../../../src/infraestructure/adapters/pokemon-species.adapter";

describe("PokemonSpeciesAdapter", () => {
  it("requests and maps species", async () => {
    const request = vi
      .fn()
      .mockResolvedValue({ data: { id: 25, name: "pikachu", extra: true } });
    const adapter = new PokemonSpeciesAdapter({ request } as IHttpClient);
    await expect(adapter.getSpecies("pikachu")).resolves.toEqual({
      id: 25,
      name: "pikachu",
    });
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      path: "https://pokeapi.co/api/v2/pokemon-species/:name",
      pathParams: { name: "pikachu" },
      timeoutMs: 4000,
    });
  });
  it.each([
    [{ response: { status: 404 } }, "POKEMON_SPECIES_NOT_FOUND", 404],
    [new Error("offline"), "EXTERNAL_SERVICE_ERROR", 502],
  ])("maps upstream failures", async (cause, code, statusCode) => {
    const request = vi.fn().mockRejectedValue(cause);
    await expect(
      new PokemonSpeciesAdapter({ request } as IHttpClient).getSpecies("unknown"),
    ).rejects.toMatchObject({ code, statusCode });
  });
});
