import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("pg", () => {
  const queryMock = vi.fn();
  const endMock = vi.fn();

  const PoolMock = vi.fn().mockImplementation(function () {
    this.query = queryMock;
    this.end = endMock;
  });

  return {
    Pool: PoolMock,
  };
});

vi.mock("../../../src/infraestructure/logger/logger", () => {
  return {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  };
});

import {
  pool,
  connectDatabase,
  closeDatabase,
} from "../../../src/infraestructure/database/postgres";
import { logger } from "../../../src/infraestructure/logger/logger";

describe("Database Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should connect to database successfully", async () => {
    (pool.query as any).mockResolvedValueOnce({});

    await connectDatabase();

    expect(pool.query).toHaveBeenCalledWith("SELECT 1");
    expect(logger.info).toHaveBeenCalledWith("✅ PostgreSQL connected");
  });

  it("should log error and exit process if connection fails", async () => {
    const fakeError = new Error("Connection failed");

    (pool.query as any).mockRejectedValueOnce(fakeError);

    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as any);

    await connectDatabase();

    expect(logger.error).toHaveBeenCalledWith(
      "❌ Database connection failed",
      fakeError,
    );

    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it("should close database connection", async () => {
    const endSpy = vi.spyOn(pool, "end").mockResolvedValueOnce(undefined);

    await closeDatabase();

    expect(endSpy).toHaveBeenCalledTimes(1);
  });
});
