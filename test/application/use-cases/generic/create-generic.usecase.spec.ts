import { describe, it, expect } from "vitest";
import { CreateGenericUseCase } from "../../../../src/application/use-cases/generic/create-generic.usecase";
import { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import { DomainErrors } from "../../../../src/domain/errors/domain-errors";

describe("CreateGenericUseCase", () => {
  describe("Success cases", () => {
    it("should return a GenericResponseDto with expected data", async () => {
      const useCase = new CreateGenericUseCase();

      const request = {
        name: "Julian",
        lastName: "Arango",
        age: 32,
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result).toEqual({
        name: "Julian",
        lastName: "Arango",
        age: 32,
      });
    });
  });

  describe("Validation errors", () => {
    it("should throw DomainException when name is empty", async () => {
      const useCase = new CreateGenericUseCase();

      const request = {
        name: "",
        lastName: "Arango",
        age: 32,
      };

      await expect(useCase.execute(request)).rejects.toBeInstanceOf(DomainException);
    });

    it("should throw DomainException when name has less than 3 characters", async () => {
      const useCase = new CreateGenericUseCase();

      const request = {
        name: "Ju",
        lastName: "Arango",
        age: 32,
      };

      await expect(useCase.execute(request)).rejects.toBeInstanceOf(DomainException);
    });

    it("should throw DomainException with correct error properties", async () => {
      const useCase = new CreateGenericUseCase();

      const request = {
        name: "A",
        lastName: "Test",
        age: 20,
      };

      const expectedError = DomainErrors.GENERIC_INVALID_NAME;

      try {
        await useCase.execute(request);
      } catch (error: any) {
        expect(error).toBeInstanceOf(DomainException);
        expect(error.code).toBe(expectedError.code);
        expect(error.message).toBe(expectedError.message);
        expect(error.statusCode).toBe(expectedError.statusCode);
      }
    });
  });
});
