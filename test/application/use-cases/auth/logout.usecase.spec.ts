import { describe, expect, it, vi } from "vitest";
import { LogoutUseCase } from "../../../../src/application/use-cases/auth/logout.usecase";
import type { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";

describe("LogoutUseCase", () => {
  it("revokes a valid refresh token and permits repeated logout", async () => {
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn().mockReturnValue({ sub: "user", type: "refresh" }),
      generateToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    };
    const repository = {
      create: vi.fn(),
      rotate: vi.fn(),
      revoke: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new LogoutUseCase(authService, repository);
    await useCase.execute("refresh");
    await useCase.execute("refresh");
    expect(repository.revoke).toHaveBeenCalledTimes(2);
    expect(repository.revoke).toHaveBeenCalledWith("refresh");
  });

  it("rejects an invalid token without invoking the repository", async () => {
    const authService: IAuthService = {
      verifyToken: vi.fn(),
      verifyRefreshToken: vi.fn().mockImplementation(() => {
        throw new Error("invalid");
      }),
      generateToken: vi.fn(),
      generateRefreshToken: vi.fn(),
    };
    const repository = { create: vi.fn(), rotate: vi.fn(), revoke: vi.fn() };
    await expect(
      new LogoutUseCase(authService, repository).execute("invalid"),
    ).rejects.toMatchObject({ code: "INVALID_REFRESH_TOKEN", statusCode: 401 });
    expect(repository.revoke).not.toHaveBeenCalled();
  });
});
