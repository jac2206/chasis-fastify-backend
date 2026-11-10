import { beforeEach, describe, expect, it, vi } from "vitest";
import { RefreshTokenUseCase } from "../../../../src/application/use-cases/users/refresh-token.usecase";
import type { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import type { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";

describe("RefreshTokenUseCase", () => {
  const refreshTokenRepository = {
    create: vi.fn(),
    rotate: vi.fn().mockResolvedValue(true),
  };
  const userRepository = {
    findByDocument: vi.fn().mockResolvedValue({ status: true }),
  };
  const serviceClientRepository = {
    findByClientId: vi.fn().mockResolvedValue({ status: true }),
  };
  const createUseCase = () =>
    new RefreshTokenUseCase(
      authService,
      refreshTokenRepository,
      userRepository as never,
      serviceClientRepository as never,
    );
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

    const result = await createUseCase().execute({
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
      createUseCase().execute({
        refreshToken: "bad-token",
      }),
    ).rejects.toMatchObject<Partial<DomainException>>({
      code: "INVALID_REFRESH_TOKEN",
      statusCode: 401,
    });
    expect(authService.generateToken).not.toHaveBeenCalled();
  });

  it("rejects reuse without issuing an access token", async () => {
    vi.mocked(authService.verifyRefreshToken).mockReturnValue({
      sub: "user",
      type: "refresh",
    });
    refreshTokenRepository.rotate.mockResolvedValueOnce(false);
    await expect(
      createUseCase().execute({
        refreshToken: "used",
      }),
    ).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN", statusCode: 401 });
    expect(authService.generateToken).not.toHaveBeenCalled();
  });

  it("rejects refresh for a disabled user", async () => {
    vi.mocked(authService.verifyRefreshToken).mockReturnValue({
      sub: "user",
      type: "refresh",
    });
    userRepository.findByDocument.mockResolvedValueOnce({ status: false });
    await expect(
      createUseCase().execute({ refreshToken: "token" }),
    ).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN", statusCode: 401 });
    expect(refreshTokenRepository.rotate).not.toHaveBeenCalled();
  });
});
