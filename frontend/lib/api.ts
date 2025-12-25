// lib/api.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { adminApi } from './adminApi';

// Import all types from the types file
import type {
  User,
  RegisterData,
  LoginData,
  AuthResponse,
  ApiError,
  Course,
  CourseEnrollment,
  EnrollmentStatusResponse,
  EnrollmentResponse,
  UserEnrollmentsResponse,
  LearningTrack,
  CourseMaterial,
  MaterialItem,
  CourseStatistics,
  ExternalResource,
  AchievementBadge,
  LeaderboardParticipant,
  Leaderboard,
  CourseResourcesResponse,
  ReferralCode,
  ReferralHistory,
  ReferralStats,
  ReferralResponse,
  CreateReferralResponse,
  AdminStats,
  StatCard,
  DashboardData,
  ActivityItem,
  TopCourse,
  NewEnrollmentsWidget,
  ConsultationsWidget,
  MilestoneItem,
  StudentListItem,
  StudentDetail,
  AdminCourseListItem,
  AdminCourseDetail,
    AdminCourseTopic,
  AdminCourseMaterial,
  AdminCourseExternalResource,
  AdminCourseStudent,
  AdminCourseSprint,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Re-export the LearningTrack type for convenience
export type { LearningTrack };

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
  withCredentials: false,
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
      const referralCode = localStorage.getItem('pending_referral_code');
      
      let redirectUrl = `${API_URL}/api/auth/google/redirect`;
      
      if (referralCode) {
        redirectUrl += `?ref=${encodeURIComponent(referralCode)}`;
      }
      
      window.location.href = redirectUrl;
    },

    resendVerification: async (email: string): Promise<{ message: string }> => {
      const response = await apiClient.post('/api/email/resend-verification', { email });
      return response.data;
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

    enroll: async (
      courseId: string, 
      courseName: string, 
      coursePrice: number,
      learningTrack?: LearningTrack
    ): Promise<EnrollmentResponse> => {
      const response = await apiClient.post<EnrollmentResponse>(
        `/api/courses/${courseId}/enroll`,
        {
          course_name: courseName,
          course_price: coursePrice,
          learning_track: learningTrack,
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
      transactionId?: string,
      learningTrack?: LearningTrack
    ): Promise<{ message: string; enrollment: CourseEnrollment }> => {
      const response = await apiClient.patch(
        `/api/enrollments/${enrollmentId}/payment`,
        {
          payment_status: paymentStatus,
          transaction_id: transactionId,
          learning_track: learningTrack,
        }
      );
      return response.data;
    },
  },

  courseResources: {
    getAll: async (courseId: string): Promise<CourseResourcesResponse> => {
      const response = await apiClient.get<CourseResourcesResponse>(
        `/api/courses/${courseId}/resources`
      );
      return response.data;
    },

    markItemCompleted: async (itemId: number): Promise<{ message: string }> => {
      const response = await apiClient.post(`/api/materials/${itemId}/complete`);
      return response.data;
    },

    markItemIncomplete: async (itemId: number): Promise<{ message: string }> => {
      const response = await apiClient.post(`/api/materials/${itemId}/incomplete`);
      return response.data;
    },

    downloadMaterial: async (itemId: number) => {
      const response = await fetch(
        `${API_URL}/api/materials/${itemId}/download`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed (${response.status})`);
      }

      return await response.blob();
    },


    updateTimeSpent: async (
      courseId: string,
      minutes: number
    ): Promise<{ message: string; total_time: string }> => {
      const response = await apiClient.post(
        `/api/courses/${courseId}/resources/time-spent`,
        { minutes }
      );
      return response.data;
    },
  },

  referrals: {
    checkReferralStatus: async (): Promise<{ has_referral: boolean }> => {
      const response = await apiClient.get('/api/referrals/status');
      return response.data;
    },

    createReferralCode: async (): Promise<CreateReferralResponse> => {
      const response = await apiClient.post<CreateReferralResponse>('/api/referrals/apply');
      return response.data;
    },

    getReferralData: async (): Promise<ReferralResponse> => {
      const response = await apiClient.get<ReferralResponse>('/api/referrals');
      return response.data;
    },

    validateReferralCode: async (code: string): Promise<{ valid: boolean; message: string }> => {
      const response = await apiClient.post('/api/referrals/validate', { code });
      return response.data;
    },
  },

  adminResources: {
    createMaterial: async (
      courseId: string,
      data: { sprint_name: string; sprint_number: number; order?: number }
    ) => {
      const response = await apiClient.post(
        `/api/admin/courses/${courseId}/resources/materials`,
        data
      );
      return response.data;
    },

    updateMaterial: async (
      courseId: string,
      materialId: number,
      data: Partial<{ sprint_name: string; sprint_number: number; order: number }>
    ) => {
      const response = await apiClient.put(
        `/api/admin/courses/${courseId}/resources/materials/${materialId}`,
        data
      );
      return response.data;
    },

    deleteMaterial: async (courseId: string, materialId: number) => {
      const response = await apiClient.delete(
        `/api/admin/courses/${courseId}/resources/materials/${materialId}`
      );
      return response.data;
    },

    addMaterialItem: async (
      courseId: string,
      materialId: number,
      data: {
        title: string;
        type: 'pdf' | 'video' | 'document' | 'link';
        file_url?: string;
        file_size?: string;
        order?: number;
      }
    ) => {
      const response = await apiClient.post(
        `/api/admin/courses/${courseId}/resources/materials/${materialId}/items`,
        data
      );
      return response.data;
    },

    updateMaterialItem: async (
      itemId: number,
      data: Partial<{
        title: string;
        type: 'pdf' | 'video' | 'document' | 'link';
        file_url: string;
        file_size: string;
        order: number;
      }>
    ) => {
      const response = await apiClient.put(
        `/api/admin/courses/resources/items/${itemId}`,
        data
      );
      return response.data;
    },

    deleteMaterialItem: async (itemId: number) => {
      const response = await apiClient.delete(
        `/api/admin/courses/resources/items/${itemId}`
      );
      return response.data;
    },

uploadMaterialFile: async (
  courseId: string,
  itemId: number,
  file: File
) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await adminApi.post(
    `/api/admin/courses/${courseId}/resources/items/${itemId}/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data;
},



    createExternalResource: async (
      courseId: string,
      data: {
        category: 'video_tutorials' | 'industry_articles' | 'recommended_reading';
        title: string;
        description?: string;
        url: string;
        source: string;
        duration?: string;
        order?: number;
      }
    ) => {
      const response = await adminApi.post(
        `/api/admin/courses/${courseId}/resources/external-resources`,
        data
      );
      return response.data;
    },

    updateExternalResource: async (courseId: string, resourceId: number, data: any) => {
      const response = await adminApi.put(
        `/api/admin/courses/${courseId}/resources/external-resources/${resourceId}`,
        data
      );
      return response.data;
    },

    deleteExternalResource: async (courseId: string, resourceId: number) => {
      const response = await adminApi.delete(
        `/api/admin/courses/${courseId}/resources/external-resources/${resourceId}`
      );
      return response.data;
    },

    createBadge: async (
      courseId: string,
      data: {
        name: string;
        description: string;
        badge_color: string;
        unlock_type: 'sprint_completion' | 'course_completion' | 'milestone';
        unlock_value: number;
      }
    ) => {
      const response = await apiClient.post(
        `/api/admin/courses/${courseId}/resources/badges`,
        data
      );
      return response.data;
    },

    updateBadge: async (courseId: string, badgeId: number, data: any) => {
      const response = await apiClient.put(
        `/api/admin/courses/${courseId}/resources/badges/${badgeId}`,
        data
      );
      return response.data;
    },

    deleteBadge: async (courseId: string, badgeId: number) => {
      const response = await apiClient.delete(
        `/api/admin/courses/${courseId}/resources/badges/${badgeId}`
      );
      return response.data;
    },

    createCohort: async (
      courseId: string,
      data: { cohort_name: string; start_date: string; end_date?: string }
    ) => {
      const response = await apiClient.post(
        `/api/admin/courses/${courseId}/resources/cohort`,
        data
      );
      return response.data;
    },

    updateCohort: async (courseId: string, cohortId: number, data: any) => {
      const response = await apiClient.put(
        `/api/admin/courses/${courseId}/resources/cohort/${cohortId}`,
        data
      );
      return response.data;
    },

    addParticipant: async (
      courseId: string,
      cohortId: number,
      data: {
        user_id: number;
        rank?: number;
        sprint1_score?: number;
        sprint2_score?: number;
        sprint3_score?: number;
        sprint4_score?: number;
        overall_score?: number;
      }
    ) => {
      const response = await apiClient.post(
        `/api/admin/courses/${courseId}/resources/cohort/${cohortId}/participants`,
        data
      );
      return response.data;
    },

    updateParticipant: async (participantId: number, data: any) => {
      const response = await apiClient.put(
        `/api/admin/courses/resources/cohort/participants/${participantId}`,
        data
      );
      return response.data;
    },

    removeParticipant: async (participantId: number) => {
      const response = await apiClient.delete(
        `/api/admin/courses/resources/cohort/participants/${participantId}`
      );
      return response.data;
    },
  },

  admin: {
    getDashboard: async (): Promise<DashboardData> => {
      return await adminApi.get<DashboardData>('/api/admin/dashboard');
    },

    students: {
      getAll: async (params?: {
        search?: string;
        activity_status?: 'active' | 'inactive';
        payment_status?: 'completed' | 'pending' | 'failed';
        course_id?: string;
        per_page?: number;
        page?: number;
      }): Promise<{ data: StudentListItem[]; meta: any }> => {
        return await adminApi.get('/api/admin/students', { params } as any);
      },

      getById: async (id: number): Promise<StudentDetail> => {
        return await adminApi.get<StudentDetail>(`/api/admin/students/${id}`);
      },

      getStatistics: async (): Promise<{
        total_students: number;
        active_students: number;
        paid_students: number;
        unpaid_students: number;
        new_this_month: number;
      }> => {
        return await adminApi.get('/api/admin/students/statistics');
      },

      sendMessage: async (data: {
        student_ids: number[];
        subject: string;
        message: string;
        attachment?: File;
      }): Promise<{ message: string }> => {
        const formData = new FormData();
        
        // Option 1: Send as JSON string (Laravel will parse it)
        formData.append('student_ids', JSON.stringify(data.student_ids));
        
        // OR Option 2: Append each ID separately (keep the [] notation)
        // data.student_ids.forEach((id) => {
        //   formData.append('student_ids[]', id.toString());
        // });
        
        formData.append('subject', data.subject);
        formData.append('message', data.message);
        
        if (data.attachment) {
          formData.append('attachment', data.attachment);
        }

        return await adminApi.post('/api/admin/students/send-message', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
    },

    courses: {
      getAll: async (params?: {
        search?: string;
        status?: 'active' | 'inactive';
        per_page?: number;
        page?: number;
      }): Promise<{ data: AdminCourseListItem[]; meta: any }> => {
        return await adminApi.get('/api/admin/courses', { params } as any);
      },

      getById: async (courseId: string): Promise<AdminCourseDetail> => {
        return await adminApi.get<AdminCourseDetail>(`/api/admin/courses/${courseId}`);
      },

      getStatistics: async (): Promise<{
        total_courses: number;
        active_courses: number;
        total_enrollments: number;
        average_completion_rate: number;
      }> => {
        return await adminApi.get('/api/admin/courses/statistics');
      },

      create: async (data: {
        title: string;
        course_id: string;
        description: string;
        duration?: string;
        level?: string;
        price: number;
        is_freemium?: boolean;
        is_premium?: boolean;
      }): Promise<{ message: string; course: Course }> => {
        return await adminApi.post('/api/admin/courses', data);
      },

      update: async (courseId: string, data: Partial<{
        title: string;
        description: string;
        duration: string;
        level: string;
        price: number;
        is_freemium: boolean;
        is_premium: boolean;
      }>): Promise<{ message: string; course: Course }> => {
        return await adminApi.put(`/api/admin/courses/${courseId}`, data);
      },

      delete: async (courseId: string): Promise<{ message: string }> => {
        return await adminApi.delete(`/api/admin/courses/${courseId}`);
      },

      createSprint: async (courseId: string, data: {
        sprint_name: string;
        sprint_number: number;
        order?: number;
      }) => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/resources/materials`,
          data
        );
      },

      updateSprint: async (courseId: string, sprintId: number, data: {
        sprint_name?: string;
        sprint_number?: number;
        order?: number;
      }) => {
        return await adminApi.put(
          `/api/admin/courses/${courseId}/resources/materials/${sprintId}`,
          data
        );
      },

      deleteSprint: async (courseId: string, sprintId: number) => {
        return await adminApi.delete(
          `/api/admin/courses/${courseId}/resources/materials/${sprintId}`
        );
      },

      createTopic: async (courseId: string, sprintId: number, data: {
        title: string;
        type: 'pdf' | 'video' | 'document' | 'link';
        file_url?: string;
        file_size?: string;
        order?: number;
      }) => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/resources/materials/${sprintId}/items`,
          data
        );
      },

      updateTopic: async (courseId: string, topicId: number, data: Partial<{
        title: string;
        type: 'pdf' | 'video' | 'document' | 'link';
        file_url: string;
        file_size: string;
        order: number;
      }>) => {
        return await adminApi.put(
          `/api/admin/courses/${courseId}/resources/items/${topicId}`,
          data
        );
      },

      deleteTopic: async (courseId: string, topicId: number) => {
        return await adminApi.delete(
          `/api/admin/courses/${courseId}/resources/items/${topicId}`
        );
      },
    },
  },

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

export type { ReferralResponse, CreateReferralResponse, ReferralCode, ReferralHistory, ReferralStats, Course, CourseEnrollment, DashboardData, StudentDetail   };

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