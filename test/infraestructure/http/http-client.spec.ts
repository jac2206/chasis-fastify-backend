import { beforeEach, describe, expect, it, vi } from "vitest";

const requestMock = vi.fn();
const requestInterceptorUseMock = vi.fn();
const responseInterceptorUseMock = vi.fn();

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");

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

import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import type { ILogger } from "../../../src/domain/interfaces/logger.interface";
import { HttpClient } from "../../../src/infraestructure/http/http-client";

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

  it("logs outgoing requests through the registered request interceptor", () => {
    const onRequest = requestInterceptorUseMock.mock.calls[0][0] as (
      config: InternalAxiosRequestConfig,
    ) => InternalAxiosRequestConfig;
    const config = {
      method: "get",
      url: "/health",
      headers: { Authorization: "Bearer secret", Cookie: "session=secret" },
    } as InternalAxiosRequestConfig;

    expect(onRequest(config)).toBe(config);
    expect(loggerMock.info).toHaveBeenCalledWith("HttpClient", "HTTP_REQUEST", {
      method: "get",
    });
  });

  it("logs successful responses through the registered response interceptor", () => {
    const onResponse = responseInterceptorUseMock.mock.calls[0][0] as (
      response: AxiosResponse,
    ) => AxiosResponse;
    const response = {
      status: 200,
      config: { url: "/health" },
    } as AxiosResponse;

    expect(onResponse(response)).toBe(response);
    expect(loggerMock.info).toHaveBeenCalledWith("HttpClient", "HTTP_RESPONSE", {
      status: 200,
    });
  });

  it("logs safe response metadata and rejects from the response error interceptor", async () => {
    const onError = responseInterceptorUseMock.mock.calls[0][1] as (
      error: AxiosError,
    ) => Promise<never>;
    const error = Object.assign(new Error("upstream unavailable"), {
      config: { url: "/external", method: "get" },
      response: { status: 503 },
    }) as AxiosError;

    await expect(onError(error)).rejects.toBe(error);
    expect(loggerMock.error).toHaveBeenCalledWith("HttpClient", "HTTP_ERROR", {
      method: "get",
      status: 503,
    });
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

  it("rethrows Axios errors without replacing the original error", async () => {
    const axiosError = Object.assign(new Error("Request timed out"), {
      isAxiosError: true,
    });
    requestMock.mockRejectedValueOnce(axiosError);

    await expect(httpClient.request({ method: "GET", path: "/timeout" })).rejects.toBe(
      axiosError,
    );
  });
});
