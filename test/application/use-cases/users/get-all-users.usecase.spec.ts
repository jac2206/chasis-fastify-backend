import { describe, expect, it, vi } from "vitest";
import { GetAllUsersUseCase } from "../../../../src/application/use-cases/users/get-all-users.usecase";
import { User } from "../../../../src/domain/entities/user.entity";
import type { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";

describe("GetAllUsersUseCase", () => {
  const repository: IUserRepository = {
    save: vi.fn(),
    findByEmail: vi.fn(),
    findByDocument: vi.fn(),
    findAll: vi.fn(),
  };

  it("maps users to public list items without password hashes", async () => {
    vi.mocked(repository.findAll).mockResolvedValue([
      new User(
        "CC",
        "1037630472",
        "Test User",
        "user@test.com",
        "3001234567",
        "private-hash",
        true,
        true,
      ),
      new User(
        "CE",
        "99887766",
        "Inactive User",
        "inactive@test.com",
        null,
        "other-hash",
        false,
        false,
      ),
    ]);

    const result = await new GetAllUsersUseCase(repository).execute();

    expect(repository.findAll).toHaveBeenCalledOnce();
    expect(result).toEqual([
      {
        documentType: "CC",
        documentNumber: "1037630472",
        fullName: "Test User",
        email: "user@test.com",
        phone: "3001234567",
        hasPin: true,
        status: true,
      },
      {
        documentType: "CE",
        documentNumber: "99887766",
        fullName: "Inactive User",
        email: "inactive@test.com",
        phone: null,
        hasPin: false,
        status: false,
      },
    ]);
    expect(JSON.stringify(result)).not.toContain("hash");
  });

  it("returns an empty list when there are no users", async () => {
    vi.mocked(repository.findAll).mockResolvedValue([]);

    await expect(new GetAllUsersUseCase(repository).execute()).resolves.toEqual([]);
  });
});
