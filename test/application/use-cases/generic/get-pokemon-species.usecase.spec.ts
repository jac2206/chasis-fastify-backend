import { describe, expect, it, vi } from "vitest";
import { GetPokemonSpeciesUseCase } from "../../../../src/application/use-cases/generic/get-pokemon-species.usecase";

describe("GetPokemonSpeciesUseCase", () => {
  it("returns the species provided by its port", async () => {
    const getSpecies = vi.fn().mockResolvedValue({ id: 25, name: "pikachu" });
    await expect(
      new GetPokemonSpeciesUseCase({ getSpecies }).execute("pikachu"),
    ).resolves.toEqual({ id: 25, name: "pikachu" });
    expect(getSpecies).toHaveBeenCalledWith("pikachu");
  });
});
