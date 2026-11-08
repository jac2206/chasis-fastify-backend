import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/infraestructure/database/postgres", () => {
  return {
    pool: {
      query: vi.fn(),
    },
  };
});

import { GenericRepository } from "../../../../src/infraestructure/database/repositories/generic.repository";
import { pool } from "../../../../src/infraestructure/database/postgres";
import { Generic } from "../../../../src/domain/entities/generic.entity";

describe("GenericRepository", () => {
  let repository: GenericRepository;

  beforeEach(() => {
    repository = new GenericRepository();
    vi.clearAllMocks();
  });

  it("should save entity and return mapped Generic", async () => {
    const entity = new Generic("Julian", "Arango", 32);

    const fakeDbResponse = {
      rows: [
        {
          name: "Julian",
          last_name: "Arango",
          age: 32,
        },
      ],
    };

    (pool.query as any).mockResolvedValueOnce(fakeDbResponse);

    const result = await repository.save(entity);

    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO generics (name, last_name, age)
       VALUES ($1, $2, $3)
       RETURNING *`,
      ["Julian", "Arango", 32],
    );

    expect(result).toBeInstanceOf(Generic);
    expect(result).toEqual(new Generic("Julian", "Arango", 32));
  });

  it("should return Generic when findById finds data", async () => {
    const fakeDbResponse = {
      rows: [
        {
          name: "Julian",
          last_name: "Arango",
          age: 32,
        },
      ],
    };

    (pool.query as any).mockResolvedValueOnce(fakeDbResponse);

    const result = await repository.findById("123");

    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM generics WHERE id = $1", [
      "123",
    ]);

    expect(result).toBeInstanceOf(Generic);
    expect(result).toEqual(new Generic("Julian", "Arango", 32));
  });

  it("should return null when findById finds no data", async () => {
    const fakeDbResponse = {
      rows: [],
    };

    (pool.query as any).mockResolvedValueOnce(fakeDbResponse);

    const result = await repository.findById("999");

    expect(pool.query).toHaveBeenCalledWith("SELECT * FROM generics WHERE id = $1", [
      "999",
    ]);

    expect(result).toBeNull();
  });
});
