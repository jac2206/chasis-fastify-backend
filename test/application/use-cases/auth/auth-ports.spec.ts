import { describe, expect, it, vi } from "vitest";
import { LoginUserUseCase } from "../../../../src/application/use-cases/users/login-user.usecase";
import { User } from "../../../../src/domain/entities/user.entity";
import type { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";
import type { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";

describe("Authentication dependency ports", () => {
  it("uses an injected hasher and token durations for login", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi
        .fn()
        .mockResolvedValue(
          new User("CC", "12345", "User", "user@example.test", null, "stored-hash"),
        ),
      findByDocument: vi.fn(),
      findAll: vi.fn(),
      findPage: vi.fn(),
      save: vi.fn(),
    };
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      generateToken: vi.fn().mockReturnValue("access"),
      generateRefreshToken: vi.fn().mockReturnValue("refresh"),
    };
    const refreshTokenRepository = {
      create: vi.fn(),
      rotate: vi.fn(),
      revoke: vi.fn(),
    };
    const passwordHasher = { hash: vi.fn(), compare: vi.fn().mockResolvedValue(true) };
    const tokenDurations = { accessSeconds: 60, refreshSeconds: 120 };
    const result = await new LoginUserUseCase(
      userRepository,
      authService,
      refreshTokenRepository,
      passwordHasher,
      tokenDurations,
    ).execute({ email: "user@example.test", password: "Password1" });
    expect(passwordHasher.compare).toHaveBeenCalledWith("Password1", "stored-hash");
    expect(result).toMatchObject({ expiresIn: 60, refreshExpiresIn: 120 });
    expect(refreshTokenRepository.create).toHaveBeenCalledWith(
      "refresh",
      expect.any(Date),
    );
  });
});
