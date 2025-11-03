import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Accept: 'application/json',
  },
  timeout: 20000,
  withCredentials: false, // Not using cookies for auth
});

// 🧩 Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🧱 Response interceptor — handle expired or invalid token
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // 🔹 Handle network or connection issues
      if (error.code === 'ERR_NETWORK') {
        return Promise.reject({
          ...error,
          friendlyMessage: 'Server is unresponsive. Please try again later.',
        });
      }

      // 🔹 Handle timeouts
      if (error.code === 'ECONNABORTED') {
        return Promise.reject({
          ...error,
          friendlyMessage: 'Request timed out. Please check your connection and try again.',
        });
      }

      // 🔹 Handle unauthorized token
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/auth/');
          localStorage.removeItem('token');
          if (!isAuthPage) {
            window.location.href = '/user/auth/login';
          }
        }
      }

      // 🔹 Default: pass through
      return Promise.reject(error);
    }
  );


// ===============================
// Types
// ===============================

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  google_id?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Tool {
  id: number;
  name: string;
  icon: string;
  order: number;
}

export interface Learning {
  id: number;
  learning_point: string;
  order: number;
}

export interface Benefit {
  id: number;
  title: string;
  text: string;
  order: number;
}

export interface CareerPath {
  id: number;
  level: 'entry' | 'mid' | 'advanced' | 'specialized';
  position: string;
  order: number;
}

export interface Industry {
  id: number;
  title: string;
  text: string;
  order: number;
}

export interface Salary {
  id: number;
  entry_level: string;
  mid_level: string;
  senior_level: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface Course {
  id: number;
  course_id: string;
  title: string;
  project: string | null;
  description: string;
  hero_image: string | null;
  secondary_image: string | null;
  duration: string | null;
  level: string | null;
  price: number;
  is_freemium: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  tools?: Tool[];
  learnings?: Learning[];
  benefits?: Benefit[];
  career_paths?: CareerPath[];
  industries?: Industry[];
  salary?: Salary;
}

export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
  error?: string;
}

// Enrollment Types
export interface CourseEnrollment {
  id: number;
  user_id: number;
  course_id: string;
  course_name: string;
  course_price: number;
  payment_status: 'pending' | 'completed' | 'failed';
  transaction_id: string | null;
  enrollment_date: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentStatusResponse {
  isEnrolled: boolean;
  enrollment: CourseEnrollment | null;
}

export interface EnrollmentResponse {
  message: string;
  enrollment_id: number;
  course_id: string;
}

export interface UserEnrollmentsResponse {
  enrollments: CourseEnrollment[];
}

// ===============================
// API Methods
// ===============================

export const api = {
  auth: {
    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/register', data);
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/login', data);
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    },

    logout: async (): Promise<{ message: string }> => {
      try {
        const response = await apiClient.post('/api/logout');
        localStorage.removeItem('token');
        return response.data;
      } catch (error) {
        localStorage.removeItem('token');
        throw error;
      }
    },

    me: async (): Promise<User> => {
      const response = await apiClient.get<User>('/api/me');
      return response.data;
    },

    sendResetLink: async (email: string): Promise<{ status: string }> => {
      const response = await apiClient.post('/api/password/email', { email });
      return response.data;
    },

    resetPassword: async (data: {
      email: string;
      token: string;
      password: string;
      password_confirmation: string;
    }): Promise<{ message: string }> => {
      const response = await apiClient.post('/api/password/reset', data);
      return response.data;
    },

    googleRedirect: () => {
      window.location.href = `${API_URL}/auth/google/redirect`;
    },
  },

  courses: {
    getAll: async (): Promise<Course[]> => {
      const response = await apiClient.get<Course[]>('/api/courses');
      return response.data;
    },

    getById: async (id: number | string): Promise<Course> => {
      const response = await apiClient.get<Course>(`/api/courses/${id}`);
      return response.data;
    },
  },

  enrollment: {
    checkStatus: async (courseId: string): Promise<EnrollmentStatusResponse> => {
      const response = await apiClient.get<EnrollmentStatusResponse>(
        `/api/courses/${courseId}/enrollment-status`
      );
      return response.data;
    },

    enroll: async (courseId: string, courseName: string, coursePrice: number): Promise<EnrollmentResponse> => {
      const response = await apiClient.post<EnrollmentResponse>(
        `/api/courses/${courseId}/enroll`,
        {
          course_name: courseName,
          course_price: coursePrice,
        }
      );
      return response.data;
    },

    getUserEnrollments: async (): Promise<UserEnrollmentsResponse> => {
      const response = await apiClient.get<UserEnrollmentsResponse>('/api/courses/enrollments');
      return response.data;
    },

    updatePayment: async (
      enrollmentId: number,
      paymentStatus: 'pending' | 'completed' | 'failed',
      transactionId?: string
    ): Promise<{ message: string; enrollment: CourseEnrollment }> => {
      const response = await apiClient.patch(
        `/api/enrollments/${enrollmentId}/payment`,
        {
          payment_status: paymentStatus,
          transaction_id: transactionId,
        }
      );
      return response.data;
    },
  },

  // Generic methods
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

// Legacy export for backward compatibility
export const coursesApi = {
  getAll: api.courses.getAll,
  getById: api.courses.getById,
  getFeatured: async (limit: number = 4): Promise<Course[]> => {
    const response = await apiClient.get(`/api/courses?limit=${limit}`);
    return response.data;
  },
};

// ===============================
// Error Handler
// ===============================

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please check your connection and try again.';
      }
      return 'Unable to connect to server. Please check your internet connection.';
    }

    const apiError = error.response?.data as ApiError;

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

    if (apiError?.error) {
      return apiError.error;
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

export default api;