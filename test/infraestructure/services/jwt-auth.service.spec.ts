import { describe, it, expect, vi, beforeEach } from "vitest";

describe("JwtAuthService", () => {
  beforeEach(() => {
    vi.resetModules(); // 🔥 importante
    vi.clearAllMocks();
  });

  it("should verify token and return decoded payload", async () => {
    vi.doMock("jsonwebtoken", () => ({
      __esModule: true,
      default: {
        verify: vi.fn().mockReturnValue({
          id: "123",
          email: "test@test.com",
          type: "access",
        }),
      },
    }));

    vi.doMock("../../../src/config/env", () => ({
      env: {
        jwtSecret: "test-secret",
      },
    }));

    const { JwtAuthService } = await import(
      "../../../src/infraestructure/security/jwt-auth.service"
    );

    const service = new JwtAuthService();
    const result = service.verifyToken("valid-token");

    expect(result).toEqual({
      id: "123",
      email: "test@test.com",
      type: "access",
    });
  });

  it("should propagate jwt error", async () => {
    vi.doMock("jsonwebtoken", () => ({
      __esModule: true,
      default: {
        verify: vi.fn(() => {
          throw new Error("jwt error");
        }),
      },
    }));

    vi.doMock("../../../src/config/env", () => ({
      env: {
        jwtSecret: "test-secret",
      },
    }));

    const { JwtAuthService } = await import(
      "../../../src/infraestructure/security/jwt-auth.service"
    );

    const service = new JwtAuthService();

    expect(() => service.verifyToken("bad-token")).toThrow("jwt error");
  });
});
