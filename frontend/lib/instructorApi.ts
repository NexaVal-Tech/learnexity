// lib/instructorApi.ts

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const instructorApiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  withCredentials: false,
});

// ── Request interceptor: attach instructor token ───────────────────────────
instructorApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('instructor_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 ──────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (r?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

instructorApiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as any;

    if (error.code === 'ERR_NETWORK') {
      return Promise.reject({ ...error, friendlyMessage: 'Server is unresponsive. Please try again later.' });
    }

    if (error.response?.status === 401 && !original._retry) {
      if (original.url?.includes('/api/instructor/refresh')) {
        localStorage.removeItem('instructor_token');
        localStorage.removeItem('instructor_user');
        if (typeof window !== 'undefined') window.location.href = '/instructors/auth/login';
        return Promise.reject(error);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await instructorApiClient.post('/api/instructor/refresh');
        const newToken = res.data?.data?.token;
        if (newToken) {
          localStorage.setItem('instructor_token', newToken);
          instructorApiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          original.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return instructorApiClient(original);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('instructor_token');
        localStorage.removeItem('instructor_user');
        if (typeof window !== 'undefined') window.location.href = '/instructors/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Types ──────────────────────────────────────────────────────────────────

export interface Instructor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  specialisation?: string;
  is_active: boolean;
  last_login_at?: string;
  assigned_course_ids?: string[];
}

export interface InstructorLoginData {
  email: string;
  password: string;
}

export interface InstructorCourse {
  id: number;
  course_id: string;
  title: string;
  description: string;
  hero_image?: string;
  sprint_count: number;
}

export interface InstructorProject {
  id: number;
  title: string;
  brief: string;
  expected_outcome?: string;
  deadline?: string;
  phase: 'brief' | 'team' | 'execution' | 'review' | 'delivery';
  course_id: string;
  is_active: boolean;
  created_at: string;
}

export interface ProjectSubmission {
  id: number;
  project_id: number;
  user_id: number;
  phase: string;
  content?: string;
  file_path?: string;
  file_name?: string;
  status: 'submitted' | 'reviewed' | 'revision_requested' | 'approved';
  instructor_feedback?: string;
  reviewed_at?: string;
  user?: { id: number; name: string; email: string };
}

// ── instructorApi object ───────────────────────────────────────────────────

export const instructorApi = {
  auth: {
    login: async (data: InstructorLoginData) => {
      const response = await instructorApiClient.post('/api/instructor/login', data);
      if (response.data?.data?.token) {
        localStorage.setItem('instructor_token', response.data.data.token);
        localStorage.setItem('instructor_user', JSON.stringify(response.data.data.instructor));
      }
      return response.data;
    },

    logout: async () => {
      try {
        await instructorApiClient.post('/api/instructor/logout');
      } finally {
        localStorage.removeItem('instructor_token');
        localStorage.removeItem('instructor_user');
      }
    },

    me: async (): Promise<Instructor> => {
      const res = await instructorApiClient.get('/api/instructor/me');
      return res.data.data;
    },
  },

  courses: {
    getAll: async (): Promise<InstructorCourse[]> => {
      const res = await instructorApiClient.get('/api/instructor/courses');
      return res.data.courses;
    },

    getById: async (courseId: string) => {
      const res = await instructorApiClient.get(`/api/instructor/courses/${courseId}`);
      return res.data;
    },

    createSprint: async (courseId: string, data: { sprint_name: string; sprint_number: number; order?: number }) => {
      const res = await instructorApiClient.post(`/api/instructor/courses/${courseId}/sprints`, data);
      return res.data;
    },

    updateSprint: async (courseId: string, sprintId: number, data: any) => {
      const res = await instructorApiClient.put(`/api/instructor/courses/${courseId}/sprints/${sprintId}`, data);
      return res.data;
    },

    deleteSprint: async (courseId: string, sprintId: number) => {
      const res = await instructorApiClient.delete(`/api/instructor/courses/${courseId}/sprints/${sprintId}`);
      return res.data;
    },

    createTopic: async (courseId: string, sprintId: number, data: any) => {
      const res = await instructorApiClient.post(`/api/instructor/courses/${courseId}/sprints/${sprintId}/topics`, data);
      return res.data;
    },

    updateTopic: async (courseId: string, itemId: number, data: any) => {
      const res = await instructorApiClient.put(`/api/instructor/courses/${courseId}/topics/${itemId}`, data);
      return res.data;
    },

    deleteTopic: async (courseId: string, itemId: number) => {
      const res = await instructorApiClient.delete(`/api/instructor/courses/${courseId}/topics/${itemId}`);
      return res.data;
    },

    uploadTopicFile: async (courseId: string, itemId: number, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await instructorApiClient.post(
        `/api/instructor/courses/${courseId}/topics/${itemId}/upload`,
        formData
      );
      return res.data;
    },
  },

  projects: {
    getAll: async (courseId: string): Promise<InstructorProject[]> => {
      const res = await instructorApiClient.get(`/api/instructor/courses/${courseId}/projects`);
      return res.data.projects;
    },

    create: async (courseId: string, data: {
      title: string;
      brief: string;
      expected_outcome?: string;
      deadline?: string;
      sprint_id?: number;
    }) => {
      const res = await instructorApiClient.post(`/api/instructor/courses/${courseId}/projects`, data);
      return res.data;
    },

    advancePhase: async (projectId: number) => {
      const res = await instructorApiClient.patch(`/api/instructor/projects/${projectId}/phase`, {});
      return res.data;
    },

    getSubmissions: async (projectId: number): Promise<ProjectSubmission[]> => {
      const res = await instructorApiClient.get(`/api/instructor/projects/${projectId}/submissions`);
      return res.data.submissions;
    },

    reviewSubmission: async (submissionId: number, data: {
      status: 'reviewed' | 'revision_requested' | 'approved';
      instructor_feedback: string;
    }) => {
      const res = await instructorApiClient.post(`/api/instructor/submissions/${submissionId}/review`, data);
      return res.data;
    },
  },

  // Generic helpers
  get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await instructorApiClient.get<T>(url, config);
    return res.data;
  },
  post: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const isFormData = data instanceof FormData;
    const res = await instructorApiClient.post<T>(url, data, {
      ...config,
      headers: { ...config?.headers, ...(isFormData ? {} : { 'Content-Type': 'application/json' }) },
    });
    return res.data;
  },
  put: async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    const res = await instructorApiClient.put<T>(url, data, config);
    return res.data;
  },
  delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const res = await instructorApiClient.delete<T>(url, config);
    return res.data;
  },
};

export const handleInstructorApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'Unable to connect to server.';
    const data = error.response.data as any;
    if (error.response.status === 422 && data?.errors) {
      const first = Object.values(data.errors)[0];
      return Array.isArray(first) ? first[0] : 'Validation error';
    }
    if (error.response.status === 401) return 'Invalid credentials.';
    if (error.response.status === 403) return data?.message || 'Access denied.';
    if (error.response.status >= 500) return 'Server error. Please try again later.';
    return data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred';
};

export default instructorApi;