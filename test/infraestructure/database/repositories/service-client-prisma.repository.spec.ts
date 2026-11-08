import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../src/infraestructure/database/prisma", () => ({
  prisma: {
    service_clients: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
  },
}));

import { prisma } from "../../../../src/infraestructure/database/prisma";
import { ServiceClientPrismaRepository } from "../../../../src/infraestructure/database/repositories/service-client-prisma.repository";

const makeRow = (overrides: Record<string, unknown> = {}) => ({
  id: "client-row-id",
  client_id: "billing-service",
  client_secret_hash: "secret-hash",
  scopes: ["transactions:read"],
  status: true,
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: null,
  ...overrides,
});

describe("ServiceClientPrismaRepository", () => {
  const repository = new ServiceClientPrismaRepository();

  beforeEach(() => vi.clearAllMocks());

  it("maps service-client fields for creation and maps the created row", async () => {
    vi.mocked(prisma.service_clients.create).mockResolvedValue(makeRow() as never);

    const result = await repository.create({
      clientId: "billing-service",
      clientSecretHash: "secret-hash",
      scopes: ["transactions:read"],
    });

    expect(prisma.service_clients.create).toHaveBeenCalledWith({
      data: {
        client_id: "billing-service",
        client_secret_hash: "secret-hash",
        scopes: ["transactions:read"],
      },
    });
    expect(result).toEqual({
      clientId: "billing-service",
      clientSecretHash: "secret-hash",
      scopes: ["transactions:read"],
      status: true,
    });
  });

  it("maps an existing client by its id", async () => {
    vi.mocked(prisma.service_clients.findUnique).mockResolvedValue(makeRow() as never);

    await expect(repository.findByClientId("billing-service")).resolves.toEqual({
      clientId: "billing-service",
      clientSecretHash: "secret-hash",
      scopes: ["transactions:read"],
      status: true,
    });
    expect(prisma.service_clients.findUnique).toHaveBeenCalledWith({
      where: { client_id: "billing-service" },
    });
  });

  it("returns null for an unknown client", async () => {
    vi.mocked(prisma.service_clients.findUnique).mockResolvedValue(null);

    await expect(repository.findByClientId("missing")).resolves.toBeNull();
  });

  it("updates a client's hashed secret", async () => {
    await repository.updateSecret("billing-service", "new-hash");

    expect(prisma.service_clients.update).toHaveBeenCalledWith({
      where: { client_id: "billing-service" },
      data: { client_secret_hash: "new-hash" },
    });
  });

  it("updates a client's active status", async () => {
    await repository.updateStatus("billing-service", false);

    expect(prisma.service_clients.update).toHaveBeenCalledWith({
      where: { client_id: "billing-service" },
      data: { status: false },
    });
  });
});
