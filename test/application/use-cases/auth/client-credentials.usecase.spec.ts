import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClientCredentialsUseCase } from "../../../../src/application/use-cases/auth/client-credentials.usecase";
import type { IServiceClientRepository } from "../../../../src/domain/interfaces/repositories/service-client.repository.interface";
import type { IAuthService } from "../../../../src/domain/interfaces/services/auth.service.interface";

vi.mock("bcrypt", () => ({
  default: { compare: vi.fn() },
}));

const passwordHasher = {
  hash: async (value: string, cost: number) => bcrypt.hash(value, cost),
  compare: async (value: string, hash: string) => bcrypt.compare(value, hash),
};
const tokenDurations = { accessSeconds: 900, refreshSeconds: 2592000 };

describe("ClientCredentialsUseCase", () => {
  const repository: IServiceClientRepository = {
    findByClientId: vi.fn(),
    create: vi.fn(),
    updateSecret: vi.fn(),
    updateStatus: vi.fn(),
  };
  const authService: IAuthService = {
    verifyToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    generateToken: vi.fn().mockReturnValue("service-access-token"),
    generateRefreshToken: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("issues an access token using the client's scopes", async () => {
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true);
    vi.mocked(repository.findByClientId).mockResolvedValue({
      clientId: "billing-service",
      clientSecretHash: "hash",
      scopes: ["transactions:read"],
      status: true,
    });

    const result = await new ClientCredentialsUseCase(
      repository,
      authService,
      passwordHasher,
      tokenDurations,
    ).execute({
      clientId: "billing-service",
      clientSecret: "secret",
    });

    expect(result).toMatchObject({
      token: "service-access-token",
      tokenType: "Bearer",
    });
    expect(authService.generateToken).toHaveBeenCalledWith({
      sub: "billing-service",
      client_id: "billing-service",
      scopes: ["transactions:read"],
      type: "access",
    });
  });

  it("rejects an unknown or invalid client", async () => {
    vi.mocked(repository.findByClientId).mockResolvedValue(null);

    await expect(
      new ClientCredentialsUseCase(
        repository,
        authService,
        passwordHasher,
        tokenDurations,
      ).execute({
        clientId: "unknown",
        clientSecret: "secret",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CLIENT_CREDENTIALS", statusCode: 401 });
  });

  it("rejects an inactive client even when its secret matches", async () => {
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.compare).mockResolvedValue(true);
    vi.mocked(repository.findByClientId).mockResolvedValue({
      clientId: "billing-service",
      clientSecretHash: "hash",
      scopes: ["transactions:read"],
      status: false,
    });

    await expect(
      new ClientCredentialsUseCase(
        repository,
        authService,
        passwordHasher,
        tokenDurations,
      ).execute({
        clientId: "billing-service",
        clientSecret: "secret",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CLIENT_CREDENTIALS", statusCode: 401 });
    expect(authService.generateToken).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret and does not issue a token", async () => {
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.compare).mockResolvedValue(false);
    vi.mocked(repository.findByClientId).mockResolvedValue({
      clientId: "billing-service",
      clientSecretHash: "hash",
      scopes: ["transactions:read"],
      status: true,
    });

    await expect(
      new ClientCredentialsUseCase(
        repository,
        authService,
        passwordHasher,
        tokenDurations,
      ).execute({
        clientId: "billing-service",
        clientSecret: "wrong-secret",
      }),
    ).rejects.toMatchObject({ code: "INVALID_CLIENT_CREDENTIALS", statusCode: 401 });
    expect(authService.generateToken).not.toHaveBeenCalled();
  });
});
