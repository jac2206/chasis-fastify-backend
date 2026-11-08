import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetXIdGenericUseCase } from "../../../../src/application/use-cases/generic/getxid-generic.usecase";
import { IGenericRepository } from "../../../../src/domain/interfaces/repositories/generic.repository.interface";
import { Generic } from "../../../../src/domain/entities/generic.entity";

describe("GetXIdGenericUseCase", () => {
  let genericRepositoryMock: IGenericRepository;
  let useCase: GetXIdGenericUseCase;

  beforeEach(() => {
    // ============================
    // MOCK del Repository
    // ============================
    genericRepositoryMock = {
      findById: vi.fn(),
    } as unknown as IGenericRepository;

    useCase = new GetXIdGenericUseCase(genericRepositoryMock);
  });

  it("should return a Generic entity when it exists", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const fakeId = "123";

    const fakeGeneric: Generic = {
      name: "Julian",
      lastName: "Arango",
      age: 32,
    } as Generic;

    // MOCK
    // Cuando llamen findById devuelva fakeGeneric
    (genericRepositoryMock.findById as any).mockResolvedValue(fakeGeneric);

    // ============================
    // AAA - ACT
    // ============================
    const result = await useCase.execute(fakeId);

    // ============================
    // AAA - ASSERT
    // ============================

    //Verifica que el método fue llamado
    expect(genericRepositoryMock.findById).toHaveBeenCalled();

    //Verifica que fue llamado con el id correcto
    expect(genericRepositoryMock.findById).toHaveBeenCalledWith(fakeId);

    //Verifica que fue llamado una sola vez
    expect(genericRepositoryMock.findById).toHaveBeenCalledTimes(1);

    //Verifica que retorna la entidad
    expect(result).toEqual(fakeGeneric);
  });

  it("should return null when entity does not exist", async () => {
    // ============================
    //AAA - ARRANGE
    // ============================
    const fakeId = "999";

    //MOCK
    (genericRepositoryMock.findById as any).mockResolvedValue(null);

    // ============================
    //AAA - ACT
    // ============================
    const result = await useCase.execute(fakeId);

    // ============================
    //AAA - ASSERT
    // ============================

    //Se llamó correctamente
    expect(genericRepositoryMock.findById).toHaveBeenCalledWith(fakeId);

    //Retorna null
    expect(result).toBeNull();
  });

  it("should call repository exactly once (SPY example)", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const fakeId = "abc";

    (genericRepositoryMock.findById as any).mockResolvedValue(null);

    //SPY
    const spy = vi.spyOn(genericRepositoryMock, "findById");

    // ============================
    //AAA - ACT
    // ============================
    await useCase.execute(fakeId);

    // ============================
    // AAA - ASSERT
    // ============================

    //Verifica que el spy detectó la llamada
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
