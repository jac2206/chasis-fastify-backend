import type { QueryResult, QueryResultRow } from "pg";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../src/infraestructure/database/postgres", () => ({
  pool: { query: vi.fn() },
}));

import { User } from "../../../../src/domain/entities/user.entity";
import { pool } from "../../../../src/infraestructure/database/postgres";
import { UserRepository } from "../../../../src/infraestructure/database/repositories/user.repository";

interface UserRow extends QueryResultRow {
  document_type: "CC" | "CE" | "NIT" | "PT";
  document_number: string;
  full_name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  has_pin: boolean;
  status: boolean;
}

const makeRow = (overrides: Partial<UserRow> = {}): UserRow => ({
  document_type: "CC",
  document_number: "1037630472",
  full_name: "Test User",
  email: "user@test.com",
  phone: null,
  password_hash: "private-hash",
  has_pin: false,
  status: true,
  ...overrides,
});

const queryResult = (rows: UserRow[]): QueryResult<UserRow> => ({
  rows,
  rowCount: rows.length,
  command: "SELECT",
  oid: 0,
  fields: [],
});

describe("UserRepository (legacy PostgreSQL adapter)", () => {
  const repository = new UserRepository();

  beforeEach(() => vi.clearAllMocks());

  it("inserts a user with parameterized values and maps the returned row", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce(queryResult([makeRow()]));
    const user = new User(
      "CC",
      "1037630472",
      "Test User",
      "user@test.com",
      null,
      "hash",
    );

    const result = await repository.save(user);

    expect(vi.mocked(pool.query).mock.calls[0][0]).toContain(
      "VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
    );
    expect(vi.mocked(pool.query).mock.calls[0][1]).toEqual([
      "CC",
      "1037630472",
      "Test User",
      "user@test.com",
      null,
      "hash",
      false,
      true,
    ]);
    expect(result).toEqual(
      new User("CC", "1037630472", "Test User", "user@test.com", null, "private-hash"),
    );
  });

  it("looks up a user by email and maps the result", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce(queryResult([makeRow()]));

    const result = await repository.findByEmail("user@test.com");

    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM loyalty.users WHERE email = $1",
      ["user@test.com"],
    );
    expect(result).toBeInstanceOf(User);
    expect(result?.email).toBe("user@test.com");
  });

  it("returns null when the email is not found", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce(queryResult([]));

    await expect(repository.findByEmail("missing@test.com")).resolves.toBeNull();
  });

  it("looks up a user by document number and returns null when absent", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce(queryResult([]));

    await expect(repository.findByDocument("missing")).resolves.toBeNull();
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT * FROM loyalty.users WHERE document_number = $1",
      ["missing"],
    );
  });

  it("maps all rows to user entities", async () => {
    vi.mocked(pool.query).mockResolvedValueOnce(
      queryResult([
        makeRow(),
        makeRow({ document_number: "99887766", document_type: "CE" }),
      ]),
    );

    const result = await repository.findAll();

    expect(pool.query).toHaveBeenCalledOnce();
    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(User);
    expect(result[1].documentNumber).toBe("99887766");
  });
});
