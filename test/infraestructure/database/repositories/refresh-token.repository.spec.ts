import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  execute: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("../../../../src/infraestructure/database/prisma", () => ({
  prisma: { $executeRaw: database.execute, $transaction: database.transaction },
}));

import { RefreshTokenRepository } from "../../../../src/infraestructure/database/repositories/refresh-token.repository";

describe("RefreshTokenRepository", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    database.transaction.mockImplementation(async (callback) =>
      callback({ $executeRaw: database.execute }),
    );
  });

  it("stores a hash instead of the refresh token", async () => {
    await new RefreshTokenRepository().create("sensitive-token", new Date());
    const values = database.execute.mock.calls[0].slice(1);
    expect(values[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(values).not.toContain("sensitive-token");
  });

  it("does not store a replacement when the old token was already consumed", async () => {
    database.execute.mockResolvedValueOnce(0);
    const result = await new RefreshTokenRepository().rotate(
      "used",
      "replacement",
      new Date(),
    );
    expect(result).toBe(false);
    expect(database.execute).toHaveBeenCalledTimes(1);
  });

  it("inserts the replacement in the same transaction after consuming the token", async () => {
    database.execute.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    expect(await new RefreshTokenRepository().rotate("old", "new", new Date())).toBe(
      true,
    );
    expect(database.transaction).toHaveBeenCalledOnce();
    expect(database.execute).toHaveBeenCalledTimes(2);
  });
});
