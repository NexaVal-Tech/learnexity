// lib/types.ts

export type LearningTrack = 'one_on_one' | 'group_mentorship' | 'self_paced';

// ===============================
// Auth Types
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

export interface AuthResponse {
  user: User;
  token?: string;
}

export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
  error?: string;
}

// ===============================
// Course Types
// ===============================

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
  // Learning tracks
  offers_one_on_one: boolean;
  offers_group_mentorship: boolean;
  offers_self_paced: boolean;
  one_on_one_price: number | null;
  group_mentorship_price: number | null;
  self_paced_price: number | null;
  available_tracks: LearningTrack[];
  track_pricing: {
    one_on_one: number;
    group_mentorship: number;
    self_paced: number;
  };
  created_at: string;
  updated_at: string;
  tools?: Tool[];
  learnings?: Learning[];
  benefits?: Benefit[];
  career_paths?: CareerPath[];
  industries?: Industry[];
  salary?: Salary;
}

// ===============================
// Enrollment Types
// ===============================

export interface CourseEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  course_name: string;
  course_price: number;
  learning_track: LearningTrack;
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
// Course Materials Types
// ===============================

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

// ===============================
// Referral Types
// ===============================

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

// ===============================
// Admin Types
// ===============================

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

// ===============================
// Admin Course Detail Types
// ===============================
// ===============================
// Admin Course Detail Types
// ===============================

export interface AdminCourseSprint {
  id: number;
  number: number;
  week: number;
  title: string;
  topics: AdminCourseTopic[];
}

export interface AdminCourseTopic {
  id: number;
  title: string;
  type: string;
}

export interface AdminCourseMaterial {
  id: number;
  name: string;
  type: string;
  sprint: string;
  size: string;
  access: string;
  upload_date: string;
}

export interface AdminCourseExternalResource {
  id: number;
  title: string;
  type: string;
  platform: string | null;
  url: string;
  date: string;
}

export interface AdminCourseStudent {
  id: number;
  name: string;
  email: string;
  payment: string;
  activity: string;
  progress: number;
  date: string;
}

export interface AdminCourseStatistics {
  total_enrollments: number;
  active_students: number;
  avg_progress: number;
  payment_rate: number;
}

export interface AdminCourseChartData {
  sprint_completion: Array<{ sprint: string; completion: number }>;
  progress_distribution: Array<{ name: string; value: number; color: string }>;
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
  sprints: AdminCourseSprint[];
  materials: AdminCourseMaterial[];
  external_resources: AdminCourseExternalResource[];
  statistics: AdminCourseStatistics;
  students: AdminCourseStudent[];
  chart_data: AdminCourseChartData;
}

// END OF FILE - NOTHING BELOW THIS