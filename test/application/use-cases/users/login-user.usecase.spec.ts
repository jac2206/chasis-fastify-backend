import { describe, expect, it, vi } from "vitest";
import { LoginUserUseCase } from "../../../../src/application/use-cases/users/login-user.usecase";
import { User } from "../../../../src/domain/entities/user.entity";
import { IUserRepository } from "../../../../src/domain/interfaces/repositories/user.repository.interface";
import { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn().mockResolvedValue(true) },
}));

describe("LoginUserUseCase", () => {
  it("returns an access and refresh token after valid credentials", async () => {
    const userRepository: IUserRepository = {
      findByEmail: vi
        .fn()
        .mockResolvedValue(
          new User("CC", "1037630472", "Test User", "user@test.com", null, "hash"),
        ),
      findByDocument: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
    };
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
      generateToken: vi.fn().mockReturnValue("access-token"),
      generateRefreshToken: vi.fn().mockReturnValue("refresh-token"),
    };

    const result = await new LoginUserUseCase(userRepository, authService).execute({
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
});
