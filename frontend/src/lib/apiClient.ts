/**
 * Unified API Client for OnlyPropFirms
 *
 * Centralizes all HTTP communication with backend services:
 * - Java Backend (Spring Boot): Port 8081 - Prop Firms, Reviews
 * - Price Intelligence (Node.js): Port 8082 - Pricing Data, Crawls, Comparisons
 *
 * Features:
 * - Environment-aware base URLs
 * - Centralized error handling
 * - Request/Response interceptors
 * - TypeScript type safety
 */

const API_CONFIG = {
  java: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1',
    timeout: 10000,
  },
  pricing: {
    baseURL: process.env.NEXT_PUBLIC_PRICING_API_URL || 'http://localhost:8082/api/v1',
    timeout: 15000, // Longer timeout for web scraping operations
  },
};

/**
 * Generic HTTP client with error handling
 */
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          response.statusText,
          await response.text()
        );
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null as T;
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'Request Timeout', 'The request took too long to complete');
        }
        throw new ApiError(0, 'Network Error', error.message);
      }

      throw new ApiError(0, 'Unknown Error', 'An unknown error occurred');
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public details?: string
  ) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
  }

  isNotFound(): boolean {
    return this.status === 404;
  }

  isUnauthorized(): boolean {
    return this.status === 401;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isNetworkError(): boolean {
    return this.status === 0;
  }
}

/**
 * Java Backend API Client (Spring Boot)
 * Handles prop firms, reviews, and general catalog data
 */
export const javaApi = new HttpClient(API_CONFIG.java.baseURL, API_CONFIG.java.timeout);

/**
 * Price Intelligence API Client (Node.js)
 * Handles pricing data, crawls, comparisons, and new deals
 */
export const pricingApi = new HttpClient(API_CONFIG.pricing.baseURL, API_CONFIG.pricing.timeout);

/**
 * Convenience exports for direct usage
 */
export default {
  java: javaApi,
  pricing: pricingApi,
  ApiError,
};
