import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginUserUseCase } from "../../../../src/application/use-cases/users/login-user.usecase";
import { User } from "../../../../src/domain/entities/user.entity";
import type { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";
import type { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn().mockResolvedValue(true) },
}));

describe("LoginUserUseCase", () => {
  const refreshTokenRepository = { create: vi.fn(), rotate: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an access and refresh token after valid credentials", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi
        .fn()
        .mockResolvedValue(
          new User("CC", "1037630472", "Test User", "user@test.com", null, "hash"),
        ),
      findByDocument: vi.fn(),
      findAll: vi.fn(),
      findPage: vi.fn(),
      save: vi.fn(),
    };
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      generateToken: vi.fn().mockReturnValue("access-token"),
      generateRefreshToken: vi.fn().mockReturnValue("refresh-token"),
    };

    const result = await new LoginUserUseCase(
      userRepository,
      authService,
      refreshTokenRepository,
    ).execute({
      email: "user@test.com",
      password: "Password1",
    });

    expect(result).toMatchObject({
      token: "access-token",
      refreshToken: "refresh-token",
      tokenType: "Bearer",
    });
    expect(authService.generateRefreshToken).toHaveBeenCalledWith({
      sub: "1037630472",
      email: "user@test.com",
      scopes: ["user"],
    });
  });

  it("rejects an unknown email without comparing a password", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findByDocument: vi.fn(),
      findAll: vi.fn(),
      findPage: vi.fn(),
      save: vi.fn(),
    };
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      generateToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    };

    await expect(
      new LoginUserUseCase(userRepository, authService, refreshTokenRepository).execute(
        {
          email: "missing@test.com",
          password: "Password1",
        },
      ),
    ).rejects.toMatchObject({ code: "USER_INVALID_CREDENTIALS", statusCode: 401 });

    const bcrypt = await import("bcrypt");
    expect(bcrypt.default.compare).not.toHaveBeenCalled();
    expect(authService.generateToken).not.toHaveBeenCalled();
  });

  it("rejects an incorrect password and does not issue tokens", async () => {
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.compare).mockResolvedValueOnce(false);
    const userRepository: IUserRepository = {
      findByEmail: vi
        .fn()
        .mockResolvedValue(
          new User("CC", "1037630472", "Test User", "user@test.com", null, "hash"),
        ),
      findByDocument: vi.fn(),
      findAll: vi.fn(),
      findPage: vi.fn(),
      save: vi.fn(),
    };
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      generateToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    };

    await expect(
      new LoginUserUseCase(userRepository, authService, refreshTokenRepository).execute(
        {
          email: "user@test.com",
          password: "WrongPassword1",
        },
      ),
    ).rejects.toMatchObject({ code: "USER_INVALID_CREDENTIALS", statusCode: 401 });
    expect(authService.generateToken).not.toHaveBeenCalled();
    expect(authService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it("rejects a disabled user without issuing tokens", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi
        .fn()
        .mockResolvedValue(
          new User("CC", "12345", "User", "user@test.com", null, "hash", false, false),
        ),
      findByDocument: vi.fn(),
      findAll: vi.fn(),
      findPage: vi.fn(),
      save: vi.fn(),
    };
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      generateToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    };
    await expect(
      new LoginUserUseCase(userRepository, authService, refreshTokenRepository).execute(
        { email: "user@test.com", password: "Password1" },
      ),
    ).rejects.toMatchObject({ code: "USER_INVALID_CREDENTIALS", statusCode: 401 });
    expect(authService.generateToken).not.toHaveBeenCalled();
  });
});
