import { describe, expect, it, vi } from "vitest";
import { GetPokemonXNameUseCase } from "../../../../src/application/use-cases/generic/get-pokemonxname.usecase";

describe("GetPokemonXNameUseCase", () => {
  it("returns the adapter result", async () => {
    const getPokemon = vi
      .fn()
      .mockResolvedValue({ name: "pikachu", height: 4, weight: 60 });
    const result = await new GetPokemonXNameUseCase({ getPokemon }).execute("pikachu");
    expect(getPokemon).toHaveBeenCalledWith("pikachu");
    expect(result).toEqual({ name: "pikachu", height: 4, weight: 60 });
  });
});
