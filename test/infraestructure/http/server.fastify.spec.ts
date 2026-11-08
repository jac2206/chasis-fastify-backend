import { vi } from "vitest";

vi.hoisted(() => {
  process.env.JWT_SECRET = "test-only-secret";
  process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "7d";
});

import type { FastifyInstance } from "fastify";
import { afterEach, describe, expect, it } from "vitest";
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
      headers: { origin: "https://loyalty-web-mocha.vercel.app" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(
      "https://loyalty-web-mocha.vercel.app",
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

  it("dispatches a valid generic request from its Fastify controller plugin", async () => {
    app = createServer();

    const response = await app.inject({
      method: "POST",
      url: "/chasis/v1/generic",
      payload: { name: "Julian", lastName: "Arango", age: 32 },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      name: "Julian",
      lastName: "Arango",
      age: 32,
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
      }),
      components: {
        securitySchemes: {
          bearerAuth: expect.any(Object),
        },
      },
    });
  });
});
