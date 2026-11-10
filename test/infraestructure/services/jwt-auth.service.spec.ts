import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("generates access and refresh tokens with separate expiry settings", async () => {
    const sign = vi
      .fn()
      .mockReturnValueOnce("access-token")
      .mockReturnValueOnce("refresh-token");
    vi.doMock("jsonwebtoken", () => ({ __esModule: true, default: { sign } }));
    vi.doMock("../../../src/config/env", () => ({
      env: {
        jwtSecret: "test-secret",
        jwtAccessExpiresIn: "15m",
        jwtRefreshExpiresIn: "30d",
      },
    }));

    const { JwtAuthService } = await import(
      "../../../src/infraestructure/security/jwt-auth.service"
    );
    const service = new JwtAuthService();
    const payload = { sub: "user-id", scopes: ["user"] };

    expect(service.generateToken({ ...payload, type: "access" })).toBe("access-token");
    expect(service.generateRefreshToken(payload)).toBe("refresh-token");
    expect(sign).toHaveBeenNthCalledWith(
      1,
      { ...payload, type: "access" },
      "test-secret",
      {
        algorithm: "HS256",
        expiresIn: "15m",
      },
    );
    expect(sign).toHaveBeenNthCalledWith(
      2,
      { ...payload, type: "refresh" },
      "test-secret",
      {
        algorithm: "HS256",
        expiresIn: "30d",
        jwtid: expect.any(String),
      },
    );
  });

  it("rejects a refresh token presented as an access token", async () => {
    const verify = vi.fn().mockReturnValue({ sub: "user-id", type: "refresh" });
    vi.doMock("jsonwebtoken", () => ({ __esModule: true, default: { verify } }));
    vi.doMock("../../../src/config/env", () => ({ env: { jwtSecret: "test-secret" } }));

    const { JwtAuthService } = await import(
      "../../../src/infraestructure/security/jwt-auth.service"
    );

    expect(() => new JwtAuthService().verifyToken("refresh-token")).toThrow(
      "Invalid token type",
    );
    expect(verify).toHaveBeenCalledWith("refresh-token", "test-secret", {
      algorithms: ["HS256"],
    });
  });

  it("rejects an access token presented as a refresh token", async () => {
    const verify = vi.fn().mockReturnValue({ sub: "user-id", type: "access" });
    vi.doMock("jsonwebtoken", () => ({ __esModule: true, default: { verify } }));
    vi.doMock("../../../src/config/env", () => ({ env: { jwtSecret: "test-secret" } }));

    const { JwtAuthService } = await import(
      "../../../src/infraestructure/security/jwt-auth.service"
    );

    expect(() => new JwtAuthService().verifyRefreshToken("access-token")).toThrow(
      "Invalid refresh token type",
    );
  });
});
