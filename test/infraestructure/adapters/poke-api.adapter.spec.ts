import { describe, expect, it, vi } from "vitest";
import type { IHttpClient } from "../../../src/domain/interfaces/http/http-client.interface";
import { PokeApiAdapter } from "../../../src/infraestructure/adapters/poke-api.adapter";

describe("PokeApiAdapter", () => {
  it("requests a Pokemon and returns its basic information", async () => {
    const request = vi.fn().mockResolvedValue({
      data: { name: "pikachu", height: 4, weight: 60, extra: true },
    });
    const adapter = new PokeApiAdapter({ request } as IHttpClient);
    await expect(adapter.getPokemon("pikachu")).resolves.toEqual({
      name: "pikachu",
      height: 4,
      weight: 60,
    });
    expect(request).toHaveBeenCalledWith({
      method: "GET",
      path: "https://pokeapi.co/api/v2/pokemon/:name",
      pathParams: { name: "pikachu" },
      timeoutMs: 4000,
    });
  });

  it("translates an upstream failure to the existing domain error", async () => {
    const request = vi.fn().mockRejectedValue(new Error("upstream error"));
    await expect(
      new PokeApiAdapter({ request } as IHttpClient).getPokemon("unknown"),
    ).rejects.toMatchObject({ code: "POKEMON_NOT_FOUND", statusCode: 404 });
  });
});
