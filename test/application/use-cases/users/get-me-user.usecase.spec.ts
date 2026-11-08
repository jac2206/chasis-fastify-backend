import { describe, expect, it, vi } from "vitest";
import { GetMeUseCase } from "../../../../src/application/use-cases/users/get-me-user.usecase";
import { User } from "../../../../src/domain/entities/user.entity";
import type { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";

describe("GetMeUseCase", () => {
  const repository: IUserRepository = {
    save: vi.fn(),
    findByEmail: vi.fn(),
    findByDocument: vi.fn(),
    findAll: vi.fn(),
  };

  it("returns the public profile for the requested document", async () => {
    vi.mocked(repository.findByDocument).mockResolvedValue(
      new User(
        "CC",
        "1037630472",
        "Test User",
        "user@test.com",
        null,
        "secret-hash",
        true,
        false,
      ),
    );

    const result = await new GetMeUseCase(repository).execute("1037630472");

    expect(repository.findByDocument).toHaveBeenCalledWith("1037630472");
    expect(result).toEqual({
      documentNumber: "1037630472",
      documentType: "CC",
      fullName: "Test User",
      email: "user@test.com",
      phone: null,
    });
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("status");
  });

  it("raises USER_NOT_FOUND when the document does not exist", async () => {
    vi.mocked(repository.findByDocument).mockResolvedValue(null);

    await expect(new GetMeUseCase(repository).execute("missing")).rejects.toMatchObject(
      { code: "USER_NOT_FOUND", statusCode: 404 },
    );
  });
});
