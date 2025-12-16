import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

import { adminApi } from './adminApi'

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
  referral_code?: string;
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

// course materials

export interface CourseMaterial {
  id: number;
  sprint_name: string;
  sprint_number: number;
  progress_percentage: number;
  completed_items: number;
  total_items: number;
  items: MaterialItem[];
}

export interface MaterialItem {
  id: number;
  title: string;
  type: 'pdf' | 'video' | 'document' | 'link';
  file_size: string | null;
  download_url: string | null;
  is_completed: boolean;
}

export interface CourseStatistics {
  overall_progress: number;
  time_spent: string;
  sprints_ahead: number;
  completed_sprints: number;
  total_sprints: number;
}

export interface ExternalResource {
  id: number;
  category: 'video_tutorials' | 'industry_articles' | 'recommended_reading';
  title: string;
  description: string | null;
  url: string;
  source: string;
  duration: string | null;
  order: number;
}

export interface AchievementBadge {
  id: number;
  name: string;
  description: string;
  badge_color: string;
  unlock_type: 'sprint_completion' | 'course_completion' | 'milestone';
  unlock_value: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export interface LeaderboardParticipant {
  rank: number;
  user_id: number;
  user_name: string;
  sprint1_score: number;
  sprint2_score: number;
  sprint3_score: number;
  sprint4_score: number;
  overall_score: number;
  is_current_user: boolean;
}

export interface Leaderboard {
  cohort_name: string;
  participants: LeaderboardParticipant[];
}

export interface CourseResourcesResponse {
  materials: CourseMaterial[];
  statistics: CourseStatistics;
  external_resources: {
    video_tutorials: ExternalResource[];
    industry_articles: ExternalResource[];
    recommended_reading: ExternalResource[];
  };
  badges: AchievementBadge[];
  leaderboard: Leaderboard | null;
  course_average: number;
}

export interface ReferralCode {
  id: number;
  user_id: number;
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards: number;
  current_streak_months: number;
  created_at: string;
  updated_at: string;
}

export interface ReferralHistory {
  id: number;
  referrer_id: number;
  referred_user_id: number;
  referred_user_name: string;
  status: 'pending' | 'completed' | 'failed';
  reward_amount: number;
  referred_at: string;
  completed_at: string | null;
}

export interface ReferralStats {
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards: number;
  current_streak_months: number;
}

export interface ReferralResponse {
  referral_code: ReferralCode;
  statistics: ReferralStats;
  history: ReferralHistory[];
}

export interface CreateReferralResponse {
  message: string;
  referral_code: string;
  referral_link: string;
}

export interface AdminStats {
  total_students: StatCard;
  active_courses: StatCard;
  pending_consultations: StatCard;
  completion_rate: StatCard;
  paid_users: StatCard;
  unpaid_users: StatCard;
}

export interface StatCard {
  value: string;
  trend: 'up' | 'down';
  percentage: string;
  label: string;
}

export interface DashboardData {
  stats: AdminStats;
  enrollment_chart: Array<{ month: string; enrollments: number }>;
  distribution_chart: Array<{ name: string; value: number; color: string }>;
  performance_chart: Array<{ course: string; students: number }>;
  recent_activity: ActivityItem[];
  top_courses: TopCourse[];
  new_enrollments: NewEnrollmentsWidget;
  upcoming_consultations: ConsultationsWidget;
  recent_milestones: MilestoneItem[];
}

export interface ActivityItem {
  type: string;
  title: string;
  time: string;
  icon: string;
  color: string;
  bg: string;
}

export interface TopCourse {
  id: number;
  course_id: string;
  title: string;
  students: number;
  revenue: string;
  completion_rate: string;
}

export interface NewEnrollmentsWidget {
  today: number;
  this_week: number;
  recent: Array<{
    student_name: string;
    course_name: string;
    time: string;
  }>;
}

export interface ConsultationsWidget {
  total: number;
  upcoming: Array<{
    student_name: string;
    course: string;
    time: string;
  }>;
}

export interface MilestoneItem {
  title: string;
  description: string;
  date: string;
  icon: string;
  color: string;
  bg: string;
}

export interface StudentListItem {
  id: number;
  name: string;
  email: string;
  courses_count: number;
  activity_status: 'active' | 'inactive';
  has_paid: boolean;
  created_at: string;
}

export interface StudentDetail {
  student: {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: string;
    initials: string;
    registration_date: string;
    payment_status: string;
    activity_status: string;
    courses_enrolled_count: number;
  };
  courses: Array<{
    id: number;
    course_id: string;
    course_name: string;
    status: string;
    enrolled_date: string;
    completed_date?: string;
    overall_progress: number;
    sprints: { completed: number; total: number };
    topics: { completed: number; total: number };
    sprint_progress: number;
    topic_progress: number;
  }>;
  performance: {
    last_active: string;
    attendance_rate: number;
    average_progress: number;
  };
  activities: Array<{
    title: string;
    description: string;
    date: string;
    type: string;
    icon: string;
    color: string;
  }>;
}

export interface AdminCourseListItem {
  id: number;
  course_id: string;
  title: string;
  stats: {
    total_enrollments: number;
    active_students: number;
    completion_rate: number;
    sprint_count: number;
    week_count: number;
  };
}

export interface AdminCourseDetail {
  course: {
    id: number;
    course_id: string;
    name: string;
    instructor: string;
    sprints_count: number;
    weeks_count: number;
  };
  sprints: Array<{
    id: number;
    number: number;
    week: number;
    title: string;
    topics: Array<{
      id: number;
      title: string;
      type: string;
    }>;
  }>;
  materials: Array<{
    id: number;
    name: string;
    type: string;
    sprint: string;
    size: string;
    access: string;
    upload_date: string;
  }>;
  external_resources: Array<{
    id: number;
    title: string;
    type: string;
    platform: string | null;
    url: string;
    date: string;
  }>;
  statistics: {
    total_enrollments: number;
    active_students: number;
    avg_progress: number;
    payment_rate: number;
  };
  students: Array<{
    id: number;
    name: string;
    email: string;
    payment: string;
    activity: string;
    progress: number;
    date: string;
  }>;
  chart_data: {
    sprint_completion: Array<{ sprint: string; completion: number }>;
    progress_distribution: Array<{ name: string; value: number; color: string }>;
  };
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
      // Get referral code from localStorage if it exists
      const referralCode = localStorage.getItem('pending_referral_code');
      
      let redirectUrl = `${API_URL}/api/auth/google/redirect`;
      
      // Add referral code as query parameter if it exists
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

  // course materials api
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

    downloadMaterial: async (itemId: number): Promise<Blob> => {
      const response = await apiClient.get(`/api/materials/${itemId}/download`, {
        responseType: 'blob',
      });
      return response.data;
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
    // Check if user has a referral code
    checkReferralStatus: async (): Promise<{ has_referral: boolean }> => {
      const response = await apiClient.get('/api/referrals/status');
      return response.data;
    },

    // Create/Apply for a referral code
    createReferralCode: async (): Promise<CreateReferralResponse> => {
      const response = await apiClient.post<CreateReferralResponse>('/api/referrals/apply');
      return response.data;
    },

    // Get user's referral data (code, stats, history)
    getReferralData: async (): Promise<ReferralResponse> => {
      const response = await apiClient.get<ReferralResponse>('/api/referrals');
      return response.data;
    },

    // Validate a referral code during registration
    validateReferralCode: async (code: string): Promise<{ valid: boolean; message: string }> => {
      const response = await apiClient.post('/api/referrals/validate', { code });
      return response.data;
    },
  },

  // Admin methods for managing resources
  adminResources: {
    // Course Materials
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

    // Material Items
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

    uploadMaterialFile: async (itemId: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(
        `/api/admin/courses/resources/items/${itemId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },

    // External Resources
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
      const response = await apiClient.post(
        `/api/admin/courses/${courseId}/resources/external-resources`,
        data
      );
      return response.data;
    },

    updateExternalResource: async (courseId: string, resourceId: number, data: any) => {
      const response = await apiClient.put(
        `/api/admin/courses/${courseId}/resources/external-resources/${resourceId}`,
        data
      );
      return response.data;
    },

    deleteExternalResource: async (courseId: string, resourceId: number) => {
      const response = await apiClient.delete(
        `/api/admin/courses/${courseId}/resources/external-resources/${resourceId}`
      );
      return response.data;
    },

    // Achievement Badges
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

    // Cohort Management
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
    // Dashboard - NOW USES adminApi client
    getDashboard: async (): Promise<DashboardData> => {
      return await adminApi.get<DashboardData>('/api/admin/dashboard');
    },

    // Students
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
      }): Promise<{ message: string }> => {
        return await adminApi.post('/api/admin/students/send-message', data);
      },
    },

    // Courses
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

      // Sprints Management
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

      // Topics Management
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

  // Generic methods - keep as is for regular user routes
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
};// Legacy export for backward compatibility
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