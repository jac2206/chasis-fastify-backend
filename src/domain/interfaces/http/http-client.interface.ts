export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  pathParams?: Record<string, string | number>;
  queryParams?: Record<string, string | number>;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  contentType?: string;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, unknown>;
}

export interface IHttpClient {
  request<T>(options: HttpRequestOptions): Promise<HttpResponse<T>>;
}
