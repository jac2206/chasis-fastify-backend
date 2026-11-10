import { beforeEach, describe, expect, it, vi } from "vitest";
import { User } from "../../../../src/domain/entities/user.entity";

vi.mock("../../../../src/infraestructure/database/prisma", () => ({
  prisma: {
    users: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
  },
}));

import { prisma } from "../../../../src/infraestructure/database/prisma";
import { UserPrismaRepository } from "../../../../src/infraestructure/database/repositories/user-prisma.repository";

const makeRow = (overrides: Record<string, unknown> = {}) => ({
  id: "user-row-id",
  document_number: "1037630472",
  document_type: "CC",
  full_name: "Test User",
  email: "user@test.com",
  phone: null,
  password_hash: "private-hash",
  has_pin: false,
  pin_hash: null,
  status: true,
  created_at: new Date("2025-01-01T00:00:00.000Z"),
  updated_at: null,
  created_by: null,
  updated_by: null,
  ...overrides,
});

describe("UserPrismaRepository", () => {
  const repository = new UserPrismaRepository();

  beforeEach(() => vi.clearAllMocks());

  it("maps a domain user to Prisma columns and maps the saved row back", async () => {
    vi.mocked(prisma.users.create).mockResolvedValue(makeRow() as never);
    const user = new User(
      "CC",
      "1037630472",
      "Test User",
      "user@test.com",
      null,
      "hash",
    );

    const result = await repository.save(user);

    expect(prisma.users.create).toHaveBeenCalledWith({
      data: {
        document_number: "1037630472",
        full_name: "Test User",
        email: "user@test.com",
        phone: null,
        password_hash: "hash",
        has_pin: false,
        status: true,
        document_type: "CC",
      },
    });
    expect(result).toEqual(
      new User("CC", "1037630472", "Test User", "user@test.com", null, "private-hash"),
    );
    expect(result).toBeInstanceOf(User);
  });

  it("maps a matching email row to a domain user", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(makeRow() as never);

    const result = await repository.findByEmail("user@test.com");

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: "user@test.com" },
    });
    expect(result).toEqual(
      new User(
        "CC",
        "1037630472",
        "Test User",
        "user@test.com",
        null,
        "private-hash",
        false,
        true,
      ),
    );
  });

  it("returns null when no email row exists", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    await expect(repository.findByEmail("missing@test.com")).resolves.toBeNull();
  });

  it("queries by document number and maps the matching row", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(
      makeRow({ phone: "3001234567" }) as never,
    );

    const result = await repository.findByDocument("1037630472");

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { document_number: "1037630472" },
    });
    expect(result?.phone).toBe("3001234567");
  });

  it("returns null when the document number does not exist", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    await expect(repository.findByDocument("missing")).resolves.toBeNull();
  });

  it("maps every row returned by findMany", async () => {
    vi.mocked(prisma.users.findMany).mockResolvedValue([
      makeRow(),
      makeRow({
        document_number: "99887766",
        document_type: "CE",
        email: "other@test.com",
      }),
    ] as never);

    const result = await repository.findAll();

    expect(prisma.users.findMany).toHaveBeenCalledOnce();
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(User);
    expect(result[1].documentNumber).toBe("99887766");
  });

  it("queries a stable page and counts all users", async () => {
    vi.mocked(prisma.users.findMany).mockResolvedValue([makeRow()] as never);
    vi.mocked(prisma.users.count).mockResolvedValue(21 as never);
    const result = await repository.findPage(2, 20);
    expect(prisma.users.findMany).toHaveBeenCalledWith({
      orderBy: { document_number: "asc" },
      skip: 20,
      take: 20,
    });
    expect(result.total).toBe(21);
    expect(result.users).toHaveLength(1);
  });
});
