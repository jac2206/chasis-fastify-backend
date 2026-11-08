import { describe, it, expect, vi, beforeEach } from "vitest";

const requestMock = vi.fn();
const requestInterceptorUseMock = vi.fn();
const responseInterceptorUseMock = vi.fn();

vi.mock("axios", async () => {
  const actual: any = await vi.importActual("axios");

  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        request: requestMock,
        interceptors: {
          request: { use: requestInterceptorUseMock },
          response: { use: responseInterceptorUseMock },
        },
      })),
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

import axios from "axios";
import { HttpClient } from "../../../src/infraestructure/http/http-client";
import { ILogger } from "../../../src/domain/interfaces/logger.interface";

describe("HttpClient", () => {
  let loggerMock: ILogger;
  let httpClient: HttpClient;

  beforeEach(() => {
    vi.clearAllMocks();

    loggerMock = {
      info: vi.fn(),
      error: vi.fn(),
    } as unknown as ILogger;

    httpClient = new HttpClient(loggerMock);
  });

  it("should initialize axios with timeout", () => {
    expect(axios.create).toHaveBeenCalled();
  });

  it("should call axios request with correct config", async () => {
    const fakeResponse = {
      data: { name: "pikachu" },
      status: 200,
      headers: {},
    };

    requestMock.mockResolvedValueOnce(fakeResponse);

    const result = await httpClient.request({
      method: "GET",
      path: "/pokemon/:name",
      pathParams: { name: "pikachu" },
      queryParams: { test: "1" },
      headers: { Authorization: "Bearer token" },
      timeoutMs: 3000,
    });

    expect(requestMock).toHaveBeenCalledWith({
      method: "GET",
      url: "/pokemon/pikachu",
      params: { test: "1" },
      data: undefined,
      timeout: 3000,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token",
      },
    });

    expect(result).toEqual({
      data: { name: "pikachu" },
      status: 200,
      headers: {},
    });
  });

  it("should encode path params correctly", async () => {
    requestMock.mockResolvedValueOnce({
      data: {},
      status: 200,
      headers: {},
    });

    await httpClient.request({
      method: "GET",
      path: "/pokemon/:name",
      pathParams: { name: "mr mime" },
    });

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/pokemon/mr%20mime",
      }),
    );
  });

  it("should throw axios error when axios fails", async () => {
    const axiosError = new Error("Unexpected HTTP client error");

    requestMock.mockRejectedValueOnce(axiosError);

    await expect(
      httpClient.request({
        method: "GET",
        path: "/test",
      }),
    ).rejects.toThrow("Unexpected HTTP client error");
  });

  it("should throw generic error when unknown error occurs", async () => {
    requestMock.mockRejectedValueOnce("unexpected");

    await expect(
      httpClient.request({
        method: "GET",
        path: "/test",
      }),
    ).rejects.toThrow("Unexpected HTTP client error");
  });
});
