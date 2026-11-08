import { beforeEach, describe, expect, it, vi } from "vitest";
import { RegisterUserUseCase } from "../../../../src/application/use-cases/users/register-user.usecase";
import { User } from "../../../../src/domain/entities/user.entity";
import type { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import type { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";

vi.mock("bcrypt", () => ({ default: { hash: vi.fn() } }));

describe("RegisterUserUseCase", () => {
  const repository: IUserRepository = {
    save: vi.fn(),
    findByEmail: vi.fn(),
    findByDocument: vi.fn(),
    findAll: vi.fn(),
  };

  const input = {
    documentType: "CC" as const,
    documentNumber: "1037630472",
    fullName: "Test User",
    email: "user@test.com",
    phone: "3001234567",
    password: "Password1",
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.hash).mockResolvedValue("hashed-password");
  });

  it("rejects a weak password before accessing the repository", async () => {
    await expect(
      new RegisterUserUseCase(repository).execute({ ...input, password: "weak" }),
    ).rejects.toMatchObject<Partial<DomainException>>({
      code: "USER_WEAK_PASSWORD",
      statusCode: 422,
    });

    expect(repository.findByEmail).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("rejects an email that is already registered", async () => {
    vi.mocked(repository.findByEmail).mockResolvedValue(
      new User("CC", "1037630472", "Existing User", input.email, null, "hash"),
    );

    await expect(
      new RegisterUserUseCase(repository).execute(input),
    ).rejects.toMatchObject({
      code: "USER_EMAIL_ALREADY_EXISTS",
      statusCode: 409,
    });

    const bcrypt = await import("bcrypt");
    expect(bcrypt.default.hash).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("hashes and persists a valid user, returning only public fields", async () => {
    vi.mocked(repository.findByEmail).mockResolvedValue(null);
    vi.mocked(repository.save).mockImplementation(async (user) => user);

    const result = await new RegisterUserUseCase(repository).execute(input);

    const bcrypt = await import("bcrypt");
    expect(bcrypt.default.hash).toHaveBeenCalledWith(input.password, 10);
    expect(repository.save).toHaveBeenCalledOnce();
    const savedUser = vi.mocked(repository.save).mock.calls[0][0];
    expect(savedUser).toBeInstanceOf(User);
    expect(savedUser.toPersistence()).toMatchObject({
      documentNumber: input.documentNumber,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      password_hash: "hashed-password",
      status: true,
    });
    expect(result).toEqual({
      id: input.documentNumber,
      email: input.email,
      fullName: input.fullName,
      message: "User registered successfully",
    });
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("persists a missing optional phone as null", async () => {
    vi.mocked(repository.findByEmail).mockResolvedValue(null);
    vi.mocked(repository.save).mockImplementation(async (user) => user);

    await new RegisterUserUseCase(repository).execute({
      ...input,
      phone: undefined,
    });

    expect(vi.mocked(repository.save).mock.calls[0][0].phone).toBeNull();
  });
});
