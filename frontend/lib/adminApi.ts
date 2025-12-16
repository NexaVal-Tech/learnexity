import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create separate axios instance for admin
const adminApiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
  withCredentials: false,
});

// Add logging to the request interceptor
adminApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      console.log('🔑 Admin Token Check:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : 'NO TOKEN',
        url: config.url
      });
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle expired or invalid admin token
adminApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({
        ...error,
        friendlyMessage: 'Server is unresponsive. Please try again later.',
      });
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject({
        ...error,
        friendlyMessage: 'Request timed out. Please check your connection and try again.',
      });
    }

    // Handle unauthorized admin token
if (error.response?.status === 401) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
}


    return Promise.reject(error);
  }
);

// ===============================
// Types
// ===============================

export interface Admin {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface AdminAuthResponse {
  success: boolean;
  message?: string;
  data?: {
    admin: Admin;
    token: string;
    token_type: string;
  };
}

export interface AdminApiError {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// ===============================
// Admin API Methods
// ===============================

export const adminApi = {
  auth: {
    login: async (data: AdminLoginData): Promise<AdminAuthResponse> => {
      const response = await adminApiClient.post<AdminAuthResponse>('/api/admin/login', data);
      
      if (response.data?.data?.token) {
        localStorage.setItem('admin_token', response.data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.data.admin));
      }
      
      return response.data;
    },

    logout: async (): Promise<{ success: boolean; message: string }> => {
      try {
        const response = await adminApiClient.post('/api/admin/logout');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        return response.data;
      } catch (error) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        throw error;
      }
    },

    me: async (): Promise<Admin> => {
      const response = await adminApiClient.get<{ success: boolean; data: Admin }>('/api/admin/me');
      return response.data.data;
    },

    refresh: async (): Promise<{ token: string }> => {
      const response = await adminApiClient.post<{ success: boolean; data: { token: string } }>('/api/admin/refresh');
      if (response.data?.data?.token) {
        localStorage.setItem('admin_token', response.data.data.token);
      }
      return response.data.data;
    },

    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
      const response = await adminApiClient.post('/api/admin/forgot-password', { email });
      return response.data;
    },

    resetPassword: async (data: {
      email: string;
      token: string;
      password: string;
      password_confirmation: string;
    }): Promise<{ success: boolean; message: string }> => {
      const response = await adminApiClient.post('/api/admin/reset-password', data);
      return response.data;
    },
  },

  // ⚠️ UPDATED: Generic methods with proper config support
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await adminApiClient.get<T>(url, config);
    return response.data;
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await adminApiClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await adminApiClient.put<T>(url, data, config);
    return response.data;
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await adminApiClient.delete<T>(url, config);
    return response.data;
  },
};
// ===============================
// Error Handler
// ===============================

export const handleAdminApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please check your connection and try again.';
      }
      return 'Unable to connect to server. Please check your internet connection.';
    }

    const apiError = error.response?.data as AdminApiError;

    if (error.response.status === 422 && apiError?.errors) {
      const firstError = Object.values(apiError.errors)[0];
      return Array.isArray(firstError) ? firstError[0] : 'Validation error';
    }

    if (error.response.status === 401) {
      return 'Invalid credentials. Please try again.';
    }

    if (error.response.status >= 500) {
      return 'Server error. Please try again later.';
    }

    if (apiError?.message) {
      return apiError.message;
    }

    return error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export default adminApi;