import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import {
  IHttpClient,
  HttpRequestOptions,
  HttpResponse,
} from "../../domain/interfaces/http/http-client.interface";
import { ILogger } from "../../domain/interfaces/logger.interface";
import { env } from "../../config/env";

export class HttpClient implements IHttpClient {
  private readonly client: AxiosInstance;

  constructor(private readonly logger: ILogger) {
    this.client = axios.create({
      timeout: env.httpConfig?.timeOut,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors(): void {
    this.client.interceptors.request.use((config) => {
      this.logger.info("HttpClient", "HTTP_REQUEST", {
        method: config.method,
        url: config.url,
        headers: config.headers,
      });

      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        this.logger.info("HttpClient", "HTTP_RESPONSE", {
          status: response.status,
          url: response.config.url,
        });

        return response;
      },
      (error: AxiosError) => {
        this.logger.error("HttpClient", "HTTP_ERROR", {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          message: error.message,
        });

        return Promise.reject(error);
      },
    );
  }

  async request<T>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
    const {
      method,
      path,
      pathParams,
      queryParams,
      headers,
      body,
      timeoutMs,
      contentType,
    } = options;

    let finalPath = path;

    if (pathParams) {
      Object.entries(pathParams).forEach(([key, value]) => {
        finalPath = finalPath.replace(`:${key}`, encodeURIComponent(String(value)));
      });
    }

    const config: AxiosRequestConfig = {
      method,
      url: finalPath,
      params: queryParams,
      data: body,
      timeout: timeoutMs,
      headers: {
        "Content-Type": contentType ?? "application/json",
        ...headers,
      },
    };

    try {
      const response = await this.client.request<T>(config);
      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw error;
      }

      throw new Error("Unexpected HTTP client error");
    }
  }
}
