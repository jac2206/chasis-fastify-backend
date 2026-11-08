import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetPokemonXNameUseCase } from "../../../../src/application/use-cases/generic/get-pokemonxname.usecase";
import { ILogger } from "../../../../src/domain/interfaces/logger.interface";
import {
  IPokeApiAdapter,
  PokemonBasicInfo,
} from "../../../../src/domain/interfaces/adapters/poke-api.adapter.interface";

describe("GetPokemonXNameUseCase", () => {
  let loggerMock: ILogger;
  let pokeApiAdapterMock: IPokeApiAdapter;
  let useCase: GetPokemonXNameUseCase;

  beforeEach(() => {
    // ============================================
    // MOCK LOGGER
    // ============================================
    loggerMock = {
      info: vi.fn(),
      error: vi.fn?.(),
    } as unknown as ILogger;

    // ============================================
    // MOCK ADAPTER (External API)
    // ============================================
    pokeApiAdapterMock = {
      getPokemon: vi.fn(),
    };

    useCase = new GetPokemonXNameUseCase(loggerMock, pokeApiAdapterMock);
  });

  // =====================================================
  // SUCCESS CASE
  // =====================================================

  it("should return pokemon info and log response", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const pokemonName = "pikachu";

    const fakePokemon: PokemonBasicInfo = {
      name: "pikachu",
      height: 4,
      weight: 60,
    } as PokemonBasicInfo;

    // MOCK
    (pokeApiAdapterMock.getPokemon as any).mockResolvedValue(fakePokemon);

    // ============================
    // AAA - ACT
    // ============================
    const result = await useCase.execute(pokemonName);

    // ============================
    // AAA - ASSERT
    // ============================

    // ✔ Adapter fue llamado correctamente
    expect(pokeApiAdapterMock.getPokemon).toHaveBeenCalledWith(pokemonName);

    // ✔ Adapter fue llamado una sola vez
    expect(pokeApiAdapterMock.getPokemon).toHaveBeenCalledTimes(1);

    // ✔ Logger fue llamado con la respuesta
    expect(loggerMock.info).toHaveBeenCalledWith(
      "GetPokemonXNamecUseCase",
      "Response ExternalApi",
      fakePokemon,
    );

    // ✔ Retorna lo mismo que devuelve el adapter
    expect(result).toEqual(fakePokemon);
  });

  // =====================================================
  // ERROR CASE
  // =====================================================

  it("should propagate error if adapter fails", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const pokemonName = "mewtwo";

    const fakeError = new Error("External API failed");

    (pokeApiAdapterMock.getPokemon as any).mockRejectedValue(fakeError);

    // ============================
    // AAA - ACT & ASSERT
    // ============================

    await expect(useCase.execute(pokemonName)).rejects.toThrow("External API failed");

    // ✔ Verificamos que el adapter sí fue llamado
    expect(pokeApiAdapterMock.getPokemon).toHaveBeenCalledWith(pokemonName);

    // ✔ En este caso el logger NO debería ejecutarse
    expect(loggerMock.info).not.toHaveBeenCalled();
  });

  // =====================================================
  // SPY EXAMPLE
  // =====================================================

  it("should call logger once when success (SPY example)", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const spy = vi.spyOn(loggerMock, "info");

    const pokemonName = "bulbasaur";

    const fakePokemon = {
      name: "bulbasaur",
      height: 7,
      weight: 69,
    } as PokemonBasicInfo;

    (pokeApiAdapterMock.getPokemon as any).mockResolvedValue(fakePokemon);

    // ============================
    // AAA - ACT
    // ============================
    await useCase.execute(pokemonName);

    // ============================
    // AAA - ASSERT
    // ============================

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
