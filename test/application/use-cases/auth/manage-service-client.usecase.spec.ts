import bcrypt from "bcrypt";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManageServiceClientUseCase } from "../../../../src/application/use-cases/auth/manage-service-client.usecase";
import type { DomainException } from "../../../../src/domain/exceptions/domain.exception";
import type { IServiceClientRepository } from "../../../../src/domain/interfaces/repositories/service-client.repository.interface";

vi.mock("bcrypt", () => ({ default: { hash: vi.fn() } }));

const passwordHasher = {
  hash: async (value: string, cost: number) => bcrypt.hash(value, cost),
  compare: async (value: string, hash: string) => bcrypt.compare(value, hash),
};

describe("ManageServiceClientUseCase", () => {
  const repository: IServiceClientRepository = {
    findByClientId: vi.fn(),
    create: vi.fn(),
    updateSecret: vi.fn(),
    updateStatus: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const bcrypt = await import("bcrypt");
    vi.mocked(bcrypt.default.hash).mockResolvedValue("hashed-secret");
  });

  it("creates a client with a hashed secret and returns the plaintext secret once", async () => {
    vi.mocked(repository.findByClientId).mockResolvedValue(null);
    vi.mocked(repository.create).mockResolvedValue({
      clientId: "billing-service",
      clientSecretHash: "hashed-secret",
      scopes: ["transactions:read"],
      status: true,
    });

    const result = await new ManageServiceClientUseCase(
      repository,
      passwordHasher,
    ).create({
      clientId: "billing-service",
      scopes: ["transactions:read"],
    });

    const bcrypt = await import("bcrypt");
    expect(result.clientId).toBe("billing-service");
    expect(result.scopes).toEqual(["transactions:read"]);
    expect(result.clientSecret).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(bcrypt.default.hash).toHaveBeenCalledWith(result.clientSecret, 12);
    expect(repository.create).toHaveBeenCalledWith({
      clientId: "billing-service",
      clientSecretHash: "hashed-secret",
      scopes: ["transactions:read"],
    });
  });

  it("rejects creation when the client id already exists", async () => {
    vi.mocked(repository.findByClientId).mockResolvedValue({
      clientId: "billing-service",
      clientSecretHash: "hash",
      scopes: [],
      status: true,
    });

    await expect(
      new ManageServiceClientUseCase(repository, passwordHasher).create({
        clientId: "billing-service",
        scopes: [],
      }),
    ).rejects.toMatchObject<Partial<DomainException>>({
      code: "SERVICE_CLIENT_ALREADY_EXISTS",
      statusCode: 409,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("rotates the secret for an existing client", async () => {
    vi.mocked(repository.findByClientId).mockResolvedValue({
      clientId: "billing-service",
      clientSecretHash: "old-hash",
      scopes: [],
      status: true,
    });

    const result = await new ManageServiceClientUseCase(
      repository,
      passwordHasher,
    ).rotateSecret("billing-service");

    const bcrypt = await import("bcrypt");
    expect(result.clientId).toBe("billing-service");
    expect(result.clientSecret).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(bcrypt.default.hash).toHaveBeenCalledWith(result.clientSecret, 12);
    expect(repository.updateSecret).toHaveBeenCalledWith(
      "billing-service",
      "hashed-secret",
    );
  });

  it("does not rotate a secret for an unknown client", async () => {
    vi.mocked(repository.findByClientId).mockResolvedValue(null);

    await expect(
      new ManageServiceClientUseCase(repository, passwordHasher).rotateSecret(
        "unknown",
      ),
    ).rejects.toMatchObject({ code: "SERVICE_CLIENT_NOT_FOUND", statusCode: 404 });
    expect(repository.updateSecret).not.toHaveBeenCalled();
  });

  it("disables an existing client", async () => {
    vi.mocked(repository.findByClientId).mockResolvedValue({
      clientId: "billing-service",
      clientSecretHash: "hash",
      scopes: [],
      status: true,
    });

    await expect(
      new ManageServiceClientUseCase(repository, passwordHasher).disable(
        "billing-service",
      ),
    ).resolves.toEqual({ clientId: "billing-service", status: false });
    expect(repository.updateStatus).toHaveBeenCalledWith("billing-service", false);
  });

  it("does not change status for an unknown client", async () => {
    vi.mocked(repository.findByClientId).mockResolvedValue(null);

    await expect(
      new ManageServiceClientUseCase(repository, passwordHasher).disable("unknown"),
    ).rejects.toMatchObject({ code: "SERVICE_CLIENT_NOT_FOUND", statusCode: 404 });
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
});
