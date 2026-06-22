// lib/api.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { adminApi } from './adminApi';

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

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
  KidsCourse,
  KidsEnrollment,
  ReferralAdminStats,
  ReferralHistoryItem,
  PublicReferrer,
  ScholarshipApplication,
  ScholarshipStats,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type { LearningTrack };

const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: false,
});

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

apiClient.interceptors.response.use(
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
    return Promise.reject(error);
  }
);

// ===============================
// API Methods
// ===============================

export const api = {

  // ── AUTH ────────────────────────────────────────────────────────────────────
  auth: {
    register: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/register', data);
      if (response.data?.token) localStorage.setItem('token', response.data.token);
      return response.data;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/api/login', data);
      if (response.data?.token) localStorage.setItem('token', response.data.token);
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
      const referralCode = sessionStorage.getItem('pending_referral_code');
      let redirectUrl = `${API_URL}/api/auth/google/redirect`;
      if (referralCode) redirectUrl += `?ref=${encodeURIComponent(referralCode)}`;
      window.location.href = redirectUrl;
    },

    resendVerification: async (email: string): Promise<{ message: string }> => {
      const response = await apiClient.post('/api/email/resend-verification', { email });
      return response.data;
    },
  },

  // ── COURSES ─────────────────────────────────────────────────────────────────
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

  // ── ENROLLMENT ──────────────────────────────────────────────────────────────
  enrollment: {
    checkStatus: async (courseId: string): Promise<EnrollmentStatusResponse> => {
      const response = await apiClient.get<EnrollmentStatusResponse>(
        `/api/courses/${courseId}/enrollment-status`
      );
      return response.data;
    },

    enroll: async (
      courseId: string,
      learningTrack?: LearningTrack,
      paymentType?: 'onetime' | 'installment'
    ): Promise<EnrollmentResponse> => {
      const payload = {
        learning_track: learningTrack || 'self_paced',
        payment_type: paymentType || 'onetime',
      };
      const response = await apiClient.post<EnrollmentResponse>(
        `/api/courses/${courseId}/enroll`,
        payload
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
        `/api/courses/enrollments/${enrollmentId}/payment`,
        {
          payment_status: paymentStatus,
          transaction_id: transactionId,
          learning_track: learningTrack,
        }
      );
      return response.data;
    },
  },

  // inside the api object, after enrollment:
  trackUpgrade: {
      getOptions: async (courseId: string) => {
          const response = await apiClient.get(`/api/courses/${courseId}/upgrade/options`);
          return response.data;
      },
      initiate: async (courseId: string, data: {
          target_track: string;
          payment_type: 'onetime' | 'installment';
          hours?: number;
      }) => {
          const response = await apiClient.post(`/api/courses/${courseId}/upgrade/initiate`, data);
          return response.data;
      },
      finalise: async (
        enrollmentId: number,
        transactionId: string,
        extra: {
          target_track: string;
          upgrade_type: string;
          amount_paid: number;
          currency: string;
          hours?: number;
        }
      ) => {
        const response = await apiClient.post(
          `/api/enrollments/${enrollmentId}/finalise-upgrade`,
          { transaction_id: transactionId, ...extra }
        );
        return response.data;
      },
  },

  profile: {
    get: async () => {
        const r = await apiClient.get('/api/profile');
        return r.data;
    },
    update: async (data: {
        name?: string; phone?: string; bio?: string; location?: string;
        linkedin_url?: string; twitter_url?: string;
        github_url?: string; website_url?: string;
    }) => {
        const r = await apiClient.put('/api/profile', data);
        return r.data;
    },
    uploadAvatar: async (file: File) => {
        const form = new FormData();
        form.append('avatar', file);
        const r = await apiClient.post('/api/profile/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return r.data;
    },
    deleteAvatar: async () => {
        const r = await apiClient.delete('/api/profile/avatar');
        return r.data;
    },
    getActivity: async () => {
        const r = await apiClient.get('/api/profile/activity');
        return r.data;
    },
},

settings: {
    get: async () => {
        const r = await apiClient.get('/api/settings');
        return r.data;
    },
    updateNotifications: async (data: {
        email_notifications?: boolean;
        marketing_emails?: boolean;
        sms_notifications?: boolean;
    }) => {
        const r = await apiClient.put('/api/settings/notifications', data);
        return r.data;
    },
    updatePrivacy: async (profilePublic: boolean) => {
        const r = await apiClient.put('/api/settings/privacy', { profile_public: profilePublic });
        return r.data;
    },
    changePassword: async (data: {
        current_password?: string;
        new_password: string;
        new_password_confirmation: string;
    }) => {
        const r = await apiClient.put('/api/settings/password', data);
        return r.data;
    },
    deleteAccount: async (data: { password?: string; confirmation: string }) => {
        const r = await apiClient.delete('/api/settings/account', { data });
        return r.data;
    },
},

  // ── COURSE RESOURCES ────────────────────────────────────────────────────────
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

    getPreviewUrl: async (itemId: number) => {
        const response = await apiClient.get(`/api/materials/${itemId}/preview-url`);
        return response.data;
    },

    previewMaterial: async (itemId: number): Promise<Blob> => {
        const response = await apiClient.get(`/api/materials/${itemId}/preview`, {
            responseType: 'blob',
        });
        return response.data;
    },

    downloadMaterial: async (itemId: number) => {
      const response = await fetch(`${API_URL}/api/materials/${itemId}/download`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) throw new Error(`Download failed (${response.status})`);
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

  // ── REFERRALS ───────────────────────────────────────────────────────────────
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

  // ── ADMIN RESOURCES ─────────────────────────────────────────────────────────
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
      const response = await apiClient.delete(`/api/admin/courses/resources/items/${itemId}`);
      return response.data;
    },

    uploadMaterialFile: async (courseId: string, itemId: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await adminApi.post(
        `/api/admin/courses/${courseId}/resources/items/${itemId}/upload`,
        formData
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

  // ── ADMIN ───────────────────────────────────────────────────────────────────
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
        formData.append('student_ids', JSON.stringify(data.student_ids));
        formData.append('subject', data.subject);
        formData.append('message', data.message);
        if (data.attachment) formData.append('attachment', data.attachment);
        return await adminApi.post('/api/admin/students/send-message', formData);
      },
    },

    kids: {
      getCourses: async (): Promise<{ courses: KidsCourse[]; stats: any }> => {
        return await adminApi.get('/api/admin/kids/courses');
      },

      updateCoursePrices: async (
        courseId: number,
        data: Partial<KidsCourse>
      ): Promise<{ message: string; course: KidsCourse }> => {
        return await adminApi.put(`/api/admin/kids/courses/${courseId}/prices`, data);
      },

      getEnrollments: async (params?: {
        page?: number;
        per_page?: number;
        payment_status?: string;
        track?: string;
      }): Promise<{ data: KidsEnrollment[]; meta: any }> => {
        return await adminApi.get('/api/admin/kids/enrollments', { params } as any);
      },
    },

    referralAdmin: {
      getStats: async (): Promise<ReferralAdminStats> => {
        return await adminApi.get('/api/admin/referrals/stats');
      },

      getHistory: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: string;
        referrer_type?: 'user' | 'public';
      }): Promise<{ data: ReferralHistoryItem[]; meta: any }> => {
        return await adminApi.get('/api/admin/referrals/history', { params } as any);
      },

      getPublicReferrers: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
      }): Promise<{ data: PublicReferrer[]; meta: any }> => {
        return await adminApi.get('/api/admin/referrals/public-referrers', { params } as any);
      },
    },

    scholarships: {
      getStats: async (): Promise<ScholarshipStats> => {
        return await adminApi.get('/api/admin/scholarships/stats');
      },

      getAll: async (params?: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: 'pending' | 'approved' | 'rejected';
      }): Promise<{ data: ScholarshipApplication[]; meta: any }> => {
        return await adminApi.get('/api/admin/scholarships', { params } as any);
      },

      review: async (
        id: number,
        data: {
          status: 'approved' | 'rejected';
          review_notes?: string;
          discount_percentage?: number;
        }
      ): Promise<{ message: string }> => {
        return await adminApi.patch<any>(`/api/admin/scholarships/${id}/review`, data);
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

      create: async (data: Record<string, any>): Promise<{ message: string; course: any }> => {
        return await adminApi.post('/api/admin/courses', data);
      },

      createFormData: async (data: FormData): Promise<{ message: string; course: any }> => {
        return await adminApi.post('/api/admin/courses', data);
      },

      update: async (
        courseId: string,
        data: Record<string, any>
      ): Promise<{ message: string; course: any }> => {
        return await adminApi.put(`/api/admin/courses/${courseId}`, data);
      },

      updateFormData: async (
        courseId: string,
        data: FormData
      ): Promise<{ message: string; course: any }> => {
        return await adminApi.post(`/api/admin/courses/${courseId}/update`, data);
      },

      toggleStatus: async (courseId: string): Promise<{ message: string; is_active: boolean }> => {
          return await adminApi.patch(`/api/admin/courses/${courseId}/toggle-status`);
      },

      delete: async (courseId: string): Promise<{ message: string }> => {
        return await adminApi.delete(`/api/admin/courses/${courseId}`);
      },

      getDetails: async (courseId: string): Promise<{
        tools: any[];
        learnings: any[];
        benefits: any[];
        career_paths: any[];
        industries: any[];
        salary: any;
      }> => {
        return await adminApi.get(`/api/admin/courses/${courseId}/details`);
      },

      syncTools: async (courseId: string, data: FormData): Promise<{ message: string }> => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/details/tools/sync`,
          data
        );
      },

      syncLearnings: async (
        courseId: string,
        data: { learnings: { learning_point: string }[] }
      ): Promise<{ message: string }> => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/details/learnings/sync`,
          data
        );
      },

      syncBenefits: async (
        courseId: string,
        data: { benefits: { title: string; text: string }[] }
      ): Promise<{ message: string }> => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/details/benefits/sync`,
          data
        );
      },

      syncCareerPaths: async (
        courseId: string,
        data: { career_paths: { level: string; position: string }[] }
      ): Promise<{ message: string }> => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/details/career-paths/sync`,
          data
        );
      },

      syncIndustries: async (
        courseId: string,
        data: { industries: { title: string; text: string }[] }
      ): Promise<{ message: string }> => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/details/industries/sync`,
          data
        );
      },

      upsertSalary: async (
        courseId: string,
        data: { entry_level?: string; mid_level?: string; senior_level?: string }
      ): Promise<{ message: string }> => {
        return await adminApi.post(`/api/admin/courses/${courseId}/details/salary`, data);
      },

      createSprint: async (
        courseId: string,
        data: { sprint_name: string; sprint_number: number; order?: number }
      ) => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/resources/materials`,
          data
        );
      },

      updateSprint: async (
        courseId: string,
        sprintId: number,
        data: { sprint_name?: string; sprint_number?: number; order?: number }
      ) => {
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

      createTopic: async (
        courseId: string,
        sprintId: number,
        data: {
          title: string;
          type: 'pdf' | 'video' | 'document' | 'link' | 'text';
          file_url?: string;
          file_size?: string;
          order?: number;
          text_content?: string | null;
        }
      ) => {
        return await adminApi.post(
          `/api/admin/courses/${courseId}/resources/materials/${sprintId}/items`,
          data
        );
      },

      updateTopic: async (
        courseId: string,
        topicId: number,
        data: Partial<{
          title: string;
          type: 'pdf' | 'video' | 'document' | 'link';
          file_url: string;
          file_size: string;
          order: number;
          text_content: string | null;
        }>
      ) => {
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

  // ── ADMIN COURSE DETAILS ─────────────────────────────────────────────────────
  adminCourseDetails: {
    addTool: async (courseId: string, formData: FormData) => {
      return await adminApi.post(
        `/api/admin/courses/${courseId}/details/tools`,
        formData
      );
    },

    addLearning: async (
      courseId: string,
      data: { learning_point: string; order: number }
    ) => {
      return await adminApi.post(`/api/admin/courses/${courseId}/details/learnings`, data);
    },

    addBenefit: async (
      courseId: string,
      data: { title: string; text: string; order: number }
    ) => {
      return await adminApi.post(`/api/admin/courses/${courseId}/details/benefits`, data);
    },

    addCareerPath: async (
      courseId: string,
      data: { level: string; position: string; order: number }
    ) => {
      return await adminApi.post(`/api/admin/courses/${courseId}/details/career-paths`, data);
    },

    addIndustry: async (
      courseId: string,
      data: { title: string; text: string; order: number }
    ) => {
      return await adminApi.post(`/api/admin/courses/${courseId}/details/industries`, data);
    },

    addSalary: async (
      courseId: string,
      data: { entry_level?: string; mid_level?: string; senior_level?: string }
    ) => {
      return await adminApi.post(`/api/admin/courses/${courseId}/details/salary`, data);
    },

    deleteTool: async (courseId: string, toolId: number) => {
      return await adminApi.delete(`/api/admin/courses/${courseId}/details/tools/${toolId}`);
    },

    deleteLearning: async (courseId: string, learningId: number) => {
      return await adminApi.delete(
        `/api/admin/courses/${courseId}/details/learnings/${learningId}`
      );
    },

    deleteBenefit: async (courseId: string, benefitId: number) => {
      return await adminApi.delete(
        `/api/admin/courses/${courseId}/details/benefits/${benefitId}`
      );
    },

    deleteCareerPath: async (courseId: string, careerPathId: number) => {
      return await adminApi.delete(
        `/api/admin/courses/${courseId}/details/career-paths/${careerPathId}`
      );
    },

    deleteIndustry: async (courseId: string, industryId: number) => {
      return await adminApi.delete(
        `/api/admin/courses/${courseId}/details/industries/${industryId}`
      );
    },
  },

  // ── GENERIC HTTP HELPERS ────────────────────────────────────────────────────
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

}; // ← end of api object

// ===============================
// Legacy Exports
// ===============================

export const coursesApi = {
  getAll: api.courses.getAll,
  getById: api.courses.getById,
  getFeatured: async (limit: number = 4): Promise<Course[]> => {
    const response = await apiClient.get(`/api/courses?limit=${limit}`);
    return response.data;
  },
};

export type {
  ReferralResponse,
  CreateReferralResponse,
  ReferralCode,
  ReferralHistory,
  ReferralStats,
  Course,
  CourseEnrollment,
  DashboardData,
  StudentDetail,
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

    if (error.response.status === 401) return 'Invalid credentials. Please try again.';
    if (error.response.status >= 500) return 'Server error. Please try again later.';
    if (apiError?.error) return apiError.error;
    if (apiError?.message) return apiError.message;

    return error.message || 'An error occurred';
  }

  if (error instanceof Error) return error.message;

  return 'An unexpected error occurred';
};

export default api;