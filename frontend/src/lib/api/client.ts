import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Helper function to convert snake_case to camelCase
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// Helper function to convert camelCase to snake_case
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase());
}

// Recursively transform object keys from snake_case to camelCase
function transformKeysToCamelCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToCamelCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    Object.keys(obj).forEach(key => {
      const camelKey = toCamelCase(key);
      transformed[camelKey] = transformKeysToCamelCase(obj[key]);
    });
    return transformed;
  }

  return obj;
}

// Recursively transform object keys from camelCase to snake_case
function transformKeysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToSnakeCase(item));
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const transformed: any = {};
    Object.keys(obj).forEach(key => {
      const snakeKey = toSnakeCase(key);
      transformed[snakeKey] = transformKeysToSnakeCase(obj[key]);
    });
    return transformed;
  }

  return obj;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
      // Configure parameter serialization to handle arrays correctly for Express.js
      paramsSerializer: {
        serialize: (params) => {
          const searchParams = new URLSearchParams();

          Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) {
              return; // Skip undefined/null values
            }

            if (Array.isArray(value)) {
              // Send arrays as repeated parameters: ?status=DRAFT&status=CONFIRMED
              value.forEach(item => {
                if (item !== undefined && item !== null) {
                  searchParams.append(key, String(item));
                }
              });
            } else {
              searchParams.append(key, String(value));
            }
          });

          return searchParams.toString();
        }
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token and transform to snake_case
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = 'Bearer ' + token;
        }

        // Transform request body to snake_case for backend
        if (config.data && typeof config.data === 'object') {
          config.data = transformKeysToSnakeCase(config.data);
        }

        // NOTE: Do NOT transform query params - backend bookingController expects camelCase params
        // Leave query params as-is in camelCase (page, limit, sortBy, sortOrder, etc.)

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors, token refresh, and transform to camelCase
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Transform response data from snake_case to camelCase for frontend
        if (response.data && typeof response.data === 'object') {
          response.data = transformKeysToCamelCase(response.data);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;

        // Handle 401 errors - token expired or invalid
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });

              const { token } = response.data;
              this.setToken(token);

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = 'Bearer ' + token;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        return Promise.reject(error);
      }
    );
  }

  // Token management methods
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // HTTP methods
  public async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Get the axios instance for advanced usage
  public getInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or multiple instances
export default ApiClient;
