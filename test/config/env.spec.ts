import { afterEach, describe, expect, it, vi } from "vitest";

const loadEnvConfig = async () => {
  vi.resetModules();
  vi.doMock("dotenv", () => ({
    __esModule: true,
    default: { config: vi.fn() },
  }));

  return import("../../src/config/env");
};

describe("environment validation", () => {
  afterEach(() => {
    vi.doUnmock("dotenv");
    vi.unstubAllEnvs();
  });

  it("reports all missing required variables without exposing values", async () => {
    vi.stubEnv("JWT_SECRET", "");
    vi.stubEnv("DATABASE_URL", "");
    const { validateEnvironment } = await loadEnvConfig();

    expect(() => validateEnvironment()).toThrow(
      "Missing required environment variables: JWT_SECRET, DATABASE_URL",
    );
  });

  it("reports only the required variable that is missing", async () => {
    vi.stubEnv("JWT_SECRET", "configured-test-secret");
    vi.stubEnv("DATABASE_URL", " ");
    const { validateEnvironment } = await loadEnvConfig();

    expect(() => validateEnvironment()).toThrow(
      "Missing required environment variables: DATABASE_URL",
    );
  });

  it("accepts both required variables when configured", async () => {
    vi.stubEnv("JWT_SECRET", "configured-test-secret");
    vi.stubEnv("DATABASE_URL", "postgresql://db.example/test");
    const { validateEnvironment } = await loadEnvConfig();

    expect(() => validateEnvironment()).not.toThrow();
  });
});
