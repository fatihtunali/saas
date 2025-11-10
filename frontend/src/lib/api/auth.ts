import { apiClient } from './client';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  company_name: string;
  contact_phone?: string;
  address?: string;
}

interface User {
  id: number;
  email: string;
  role: string;
  operator_id: number | null;
  company_name: string | null;
  phone: string | null;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export const authApi = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  /**
   * Register a new operator account
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  /**
   * Get current authenticated user
   */
  me: async (): Promise<MeResponse> => {
    return apiClient.get<MeResponse>('/auth/me');
  },

  /**
   * Logout (client-side only - clear tokens)
   */
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },
};
