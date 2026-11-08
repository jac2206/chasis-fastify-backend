import { beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshTokenUseCase } from "../../../../src/application/use-cases/users/refresh-token.usecase";
import type { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import type { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";

describe("RefreshTokenUseCase", () => {
  const authService: IAuthService = {
    verifyToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    generateToken: vi.fn().mockReturnValue("new-access-token"),
    generateRefreshToken: vi.fn().mockReturnValue("new-refresh-token"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("issues a new token pair preserving the refresh claims", async () => {
    vi.mocked(authService.verifyRefreshToken).mockReturnValue({
      sub: "1037630472",
      email: "user@test.com",
      scopes: ["user"],
      type: "refresh",
    });

    const result = await new RefreshTokenUseCase(authService).execute({
      refreshToken: "refresh-token",
    });

    expect(result).toMatchObject({
      token: "new-access-token",
      refreshToken: "new-refresh-token",
      tokenType: "Bearer",
    });
    expect(authService.generateToken).toHaveBeenCalledWith({
      sub: "1037630472",
      email: "user@test.com",
      scopes: ["user"],
      type: "access",
    });
    expect(authService.generateRefreshToken).toHaveBeenCalledWith({
      sub: "1037630472",
      email: "user@test.com",
      scopes: ["user"],
    });
  });

  it("rejects an invalid or expired refresh token", async () => {
    vi.mocked(authService.verifyRefreshToken).mockImplementation(() => {
      throw new Error("invalid token");
    });

    await expect(
      new RefreshTokenUseCase(authService).execute({ refreshToken: "bad-token" }),
    ).rejects.toMatchObject<Partial<DomainException>>({
      code: "INVALID_REFRESH_TOKEN",
      statusCode: 401,
    });
    expect(authService.generateToken).not.toHaveBeenCalled();
  });
});
