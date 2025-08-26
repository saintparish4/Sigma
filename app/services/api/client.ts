import Constants from "expo-constants";

interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private accessToken: string | null = null;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...config.headers,
    };
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private buildHeaders(customHeaders?: Record<string, string>) {
    const headers = { ...this.defaultHeaders, ...customHeaders };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private buildURL(endpoint: string, params?: Record<string, any>) {
    const url = new URL(endpoint, this.baseURL);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", headers, body, params } = options;

    const url = this.buildURL(endpoint, params);
    const requestHeaders = this.buildHeaders(headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Network error occured",
        }));
        throw new ApiError(
          response.status,
          errorData.message || "Request failed"
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(408, "Request timed out");
      }

      throw new ApiError(0, "Network error occured");
    }
  }

  // Convenience methods
  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// Create and export default client instance
const apiClient = new ApiClient({
  baseURL: Constants.expoConfig?.extra?.apiBaseURL || "http://localhost:3000",
  timeout: 30000,
});

export { apiClient, ApiError };
export type { ApiClientConfig, RequestOptions };
