import { vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test-only-secret";
  process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
  process.env.CORS_ORIGINS = "https://frontend.example, http://localhost:3001";
});

import { asValue } from "awilix";
import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { container } from "../../../src/config/container";
import { DomainException } from "../../../src/domain/exceptions/domain.exception";
import { JwtAuthService } from "../../../src/infraestructure/security/jwt-auth.service";
import { createServer } from "../../../src/server";

describe("Fastify HTTP server", () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  it("serves the health endpoint with the Fastify chasis name", async () => {
    app = createServer();

    const response = await app.inject({
      method: "GET",
      url: "/chasis/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: "ok",
      service: "chasis-fastify-back",
    });
  });

  it("allows configured browser origins with credentials", async () => {
    app = createServer();

    const response = await app.inject({
      method: "GET",
      url: "/chasis/health",
      headers: { origin: "https://frontend.example" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://frontend.example",
    );
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("rejects browser origins that are not configured", async () => {
    app = createServer();

    const response = await app.inject({
      method: "GET",
      url: "/chasis/health",
      headers: { origin: "https://untrusted.example" },
    });

    expect(response.statusCode).toBe(500);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("returns the shared validation error for invalid request bodies", async () => {
    app = createServer();

    const response = await app.inject({
      method: "POST",
      url: "/chasis/v1/users/register",
      payload: {},
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Invalid request",
    });
  });

  it("returns 401 when a protected route has no token", async () => {
    app = createServer();

    const response = await app.inject({
      method: "GET",
      url: "/chasis/v1/users/me",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: "UNAUTHORIZED",
      message: "Missing token",
    });
  });

  it("returns 401 when a protected route receives an invalid token", async () => {
    app = createServer();

    const response = await app.inject({
      method: "GET",
      url: "/chasis/v1/users/me",
      headers: { authorization: "Bearer invalid-token" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: "INVALID_TOKEN",
      message: "Token invalid or expired",
    });
  });

  it("returns 403 when a valid token has no scopes", async () => {
    app = createServer();

    const token = new JwtAuthService().generateToken({
      sub: "user-id",
      type: "access",
    });

    const response = await app.inject({
      method: "GET",
      url: "/chasis/v1/users/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      code: "FORBIDDEN",
      message: "No scopes found",
    });
  });

  it("returns 403 when the access token has no required scope", async () => {
    app = createServer();

    const token = new JwtAuthService().generateToken({
      sub: "user-id",
      type: "access",
      scopes: ["different-scope"],
    });

    const response = await app.inject({
      method: "GET",
      url: "/chasis/v1/users/me",
      headers: { authorization: `Bearer ${token}` },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({
      code: "FORBIDDEN",
      message: "Insufficient permissions",
    });
  });

  it("does not allow an ordinary user to list all users", async () => {
    app = createServer();
    const token = new JwtAuthService().generateToken({
      sub: "user-id",
      type: "access",
      scopes: ["user"],
    });
    const response = await app.inject({
      method: "GET",
      url: "/chasis/v1/users/",
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.statusCode).toBe(403);
  });

  it("paginates the user list for an authorized client", async () => {
    const original = container.registrations.getAllUsersUseCase;
    const execute = vi
      .fn()
      .mockResolvedValue({ items: [], page: 2, pageSize: 5, total: 0 });
    container.register({ getAllUsersUseCase: asValue({ execute }) });
    try {
      app = createServer();
      const token = new JwtAuthService().generateToken({
        sub: "client",
        type: "access",
        scopes: ["users:read"],
      });
      const response = await app.inject({
        method: "GET",
        url: "/chasis/v1/users/?page=2&pageSize=5",
        headers: { authorization: `Bearer ${token}` },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ items: [], page: 2, pageSize: 5, total: 0 });
      expect(execute).toHaveBeenCalledWith(2, 5);
      const invalid = await app.inject({
        method: "GET",
        url: "/chasis/v1/users/?page=0",
        headers: { authorization: `Bearer ${token}` },
      });
      expect(invalid.statusCode).toBe(422);
      const tooLarge = await app.inject({
        method: "GET",
        url: "/chasis/v1/users/?pageSize=101",
        headers: { authorization: `Bearer ${token}` },
      });
      expect(tooLarge.statusCode).toBe(422);
    } finally {
      container.register({ getAllUsersUseCase: original });
    }
  });

  it("formats domain exceptions without leaking internals", async () => {
    app = createServer();

    app.get("/test/domain-error", async () => {
      throw new DomainException("TEST_CODE", "Test message", 409);
    });

    const response = await app.inject({
      method: "GET",
      url: "/test/domain-error",
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      code: "TEST_CODE",
      message: "Test message",
    });
  });

  it("formats malformed JSON as a client error", async () => {
    app = createServer();

    const response = await app.inject({
      method: "POST",
      url: "/chasis/v1/users/register",
      headers: { "content-type": "application/json" },
      payload: "{invalid-json",
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      code: "INVALID_JSON",
      message: "Invalid JSON body",
    });
  });

  it("hides unexpected error details from the HTTP response", async () => {
    app = createServer();

    app.get("/test/unexpected-error", async () => {
      throw new Error("database password leaked");
    });

    const response = await app.inject({
      method: "GET",
      url: "/test/unexpected-error",
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal Server Error",
    });
    expect(response.body).not.toContain("database password leaked");
  });

  it("exposes Fastify-generated OpenAPI documentation", async () => {
    app = createServer();

    const response = await app.inject({
      method: "GET",
      url: "/docs/json",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      openapi: expect.any(String),
      paths: expect.objectContaining({
        "/chasis/health": expect.any(Object),
        "/chasis/v1/users/register": expect.any(Object),
        "/chasis/v1/auth/logout": expect.objectContaining({ post: expect.any(Object) }),
        "/chasis/v1/generic/pokemon/{name}": expect.any(Object),
      }),
      components: {
        securitySchemes: {
          bearerAuth: expect.any(Object),
        },
      },
    });
  });

  it("accepts a refresh token for logout and documents validation errors", async () => {
    const original = container.registrations.logoutUseCase;
    const execute = vi.fn().mockResolvedValue(undefined);
    container.register({ logoutUseCase: asValue({ execute }) });
    try {
      app = createServer();
      const response = await app.inject({
        method: "POST",
        url: "/chasis/v1/auth/logout",
        payload: { refreshToken: "sample-refresh" },
      });
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe("");
      expect(execute).toHaveBeenCalledWith("sample-refresh");
      const invalid = await app.inject({
        method: "POST",
        url: "/chasis/v1/auth/logout",
        payload: {},
      });
      expect(invalid.statusCode).toBe(422);
    } finally {
      container.register({ logoutUseCase: original });
    }
  });

  it("rejects refresh after logout without revoking the prior access token", async () => {
    const originalRepository = container.registrations.refreshTokenRepository;
    const originalUsers = container.registrations.userRepository;
    let active = true;
    container.register({
      refreshTokenRepository: asValue({
        create: vi.fn(),
        revoke: vi.fn().mockImplementation(async () => {
          active = false;
        }),
        rotate: vi.fn().mockImplementation(async () => active),
      }),
      userRepository: asValue({
        findByDocument: vi.fn().mockResolvedValue({ status: true }),
      }),
    });
    try {
      app = createServer();
      const auth = new JwtAuthService();
      const refreshToken = auth.generateRefreshToken({ sub: "user", scopes: ["user"] });
      const accessToken = auth.generateToken({
        sub: "user",
        scopes: ["user"],
        type: "access",
      });
      const logout = await app.inject({
        method: "POST",
        url: "/chasis/v1/auth/logout",
        payload: { refreshToken },
      });
      expect(logout.statusCode).toBe(204);
      const refresh = await app.inject({
        method: "POST",
        url: "/chasis/v1/auth/refresh",
        payload: { refreshToken },
      });
      expect(refresh.statusCode).toBe(401);
      expect(refresh.json()).toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
      expect(auth.verifyToken(accessToken).sub).toBe("user");
      const repeated = await app.inject({
        method: "POST",
        url: "/chasis/v1/auth/logout",
        payload: { refreshToken },
      });
      expect(repeated.statusCode).toBe(204);
      const wrongType = await app.inject({
        method: "POST",
        url: "/chasis/v1/auth/logout",
        payload: { refreshToken: accessToken },
      });
      expect(wrongType.statusCode).toBe(401);
      expect(wrongType.json()).toMatchObject({ code: "INVALID_REFRESH_TOKEN" });
    } finally {
      container.register({
        refreshTokenRepository: originalRepository,
        userRepository: originalUsers,
      });
    }
  });

  it("serves the Pokemon integration through the original public route", async () => {
    const original = container.registrations.getPokemonXNameUseCase;
    const execute = vi
      .fn()
      .mockResolvedValue({ name: "pikachu", height: 4, weight: 60 });
    container.register({ getPokemonXNameUseCase: asValue({ execute }) });
    try {
      app = createServer();
      const response = await app.inject({
        method: "GET",
        url: "/chasis/v1/generic/pokemon/pikachu",
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ name: "pikachu", height: 4, weight: 60 });
      expect(execute).toHaveBeenCalledWith("pikachu");
    } finally {
      container.register({ getPokemonXNameUseCase: original });
    }
  });
});
