import { describe, it, expect, vi, beforeEach } from "vitest";
import { UpdateGenericUseCase } from "../../../../src/application/use-cases/generic/update-generic.usecase";
import { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";
import { ILogger } from "../../../../src/domain/interfaces/logger.interface";

describe("UpdateGenericUseCase", () => {
  let loggerMock: ILogger;
  let useCase: UpdateGenericUseCase;

  beforeEach(() => {
    // ============================
    // MOCK - LOGGER
    // ============================
    loggerMock = {
      info: vi.fn(), // mock function
      error: vi.fn?.(),
    } as unknown as ILogger;

    useCase = new UpdateGenericUseCase(loggerMock);
  });

  it("should update generic successfully and return data with id", async () => {
    const id = "123";

    const request = {
      name: "Julian",
      lastName: "Arango",
      age: 32,
    };

    // ============================
    // AAA - ACT
    // ============================
    const result = await useCase.execute(request, id);

    // ============================
    // AAA - ASSERT
    // ============================

    expect(result).toEqual({
      id: "123",
      name: "Julian",
      lastName: "Arango",
      age: 32,
    });

    // Logger fue llamado
    expect(loggerMock.info).toHaveBeenCalled();

    // Logger fue llamado con parámetros correctos
    expect(loggerMock.info).toHaveBeenCalledWith(
      "CreateGenericUseCase",
      "Starting create generic",
      request,
    );

    // Se llamó solo una vez
    expect(loggerMock.info).toHaveBeenCalledTimes(1);
  });

  it("should throw DomainException when id is missing", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const request = {
      name: "Julian",
      lastName: "Arango",
      age: 32,
    };

    const expectedError = DomainErrors.GENERIC_ID_REQUIRED;

    // ============================
    // AAA - ACT & ASSERT
    // ============================

    await expect(useCase.execute(request, "")).rejects.toBeInstanceOf(DomainException);

    try {
      await useCase.execute(request, "");
    } catch (error: any) {
      // ============================
      // AAA - ASSERT
      // ============================

      expect(error.code).toBe(expectedError.code);
      expect(error.message).toBe(expectedError.message);
      expect(error.statusCode).toBe(expectedError.statusCode);
    }
  });

  it("should throw DomainException when name is invalid", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const id = "123";

    const request = {
      name: "Jo", // menos de 3 caracteres
      lastName: "Arango",
      age: 32,
    };

    const expectedError = DomainErrors.GENERIC_INVALID_NAME;

    // ============================
    // AAA - ACT & ASSERT
    // ============================

    await expect(useCase.execute(request, id)).rejects.toBeInstanceOf(DomainException);

    try {
      await useCase.execute(request, id);
    } catch (error: any) {
      // ============================
      // AAA - ASSERT
      // ============================

      expect(error.code).toBe(expectedError.code);
      expect(error.message).toBe(expectedError.message);
      expect(error.statusCode).toBe(expectedError.statusCode);
    }
  });

  it("should call logger once (SPY example)", async () => {
    // ============================
    // AAA - ARRANGE
    // ============================
    const spy = vi.spyOn(loggerMock, "info");

    const id = "123";
    const request = {
      name: "Julian",
      lastName: "Arango",
      age: 32,
    };

    // ============================
    // AAA - ACT
    // ============================
    await useCase.execute(request, id);

    // ============================
    // AAA - ASSERT
    // ============================

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
