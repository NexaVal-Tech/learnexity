// pages/user/resource.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, ExternalLink, ChevronDown, ChevronUp, Trophy, Award, BookOpen, Check, CheckCircle, Clock, FileText, File, Lock } from 'lucide-react';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { api } from '@/lib/api';
import type { CourseEnrollment } from '@/lib/types';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import ResourcePreviewModal from '@/components/resources/ResourcePreviewModal';
import { AccessBlockedBanner, PaymentWarningBanner } from '@/components/user/AccessBlockedBanner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CourseResourceItem {
  id: number;
  title: string;
  type: string;
  order?: number;
  file_size?: string | null;
  download_url?: string | null;
  is_completed?: boolean;
  is_locked?: boolean;
  text_content?: string | null;
}

interface Sprint {
  id: number;
  sprint_number: number;
  sprint_name: string;
  progress_percentage: number;
  completed_items?: number;
  total_items?: number;
  is_locked?: boolean;
  items: CourseResourceItem[];
}

interface FreemiumMeta {
  is_freemium: boolean;
  free_sprint_limit: number;
  user_has_access: boolean;
}

interface LeaderboardParticipant {
  user_id: number;
  user_name: string;
  rank: number;
  is_current_user: boolean;
  sprint1_score: number;
  sprint2_score: number;
  sprint3_score: number;
  sprint4_score: number;
  overall_score: number;
}

interface ExternalResource {
  id: number;
  title: string;
  url: string;
  source: string;
  duration?: string | null;
  order?: number;
}

interface CourseResourcesData {
  materials: Sprint[];
  statistics: { overall_progress: number };
  course_average: number;
  leaderboard: { participants: LeaderboardParticipant[] };
  external_resources: {
    video_tutorials: ExternalResource[];
    industry_articles: ExternalResource[];
    recommended_reading: ExternalResource[];
  };
  badges: { id: number; is_unlocked: boolean }[];
  freemium_meta?: FreemiumMeta;
}

interface EnrolledCourse {
  course_id: number;
  course_title: string;
  course_name?: string;
}

// ─── Helper: sort items by order, then id ────────────────────────────────────

function sortItems(items: CourseResourceItem[]): CourseResourceItem[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
}

function sortExternal(items: ExternalResource[]): ExternalResource[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);
}

// ─── Locked Sprint Paywall ────────────────────────────────────────────────────

function LockedSprintRow({ title, type }: { title: string; type: string }) {
  return (
    <div className="flex items-center justify-between p-4 opacity-60 select-none">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
          <Lock className="w-4 h-4 text-gray-400" />
        </div>
        <p className="text-sm text-gray-400 line-through">{title}</p>
      </div>
      <span className="flex items-center gap-1 text-xs text-gray-300 bg-gray-50 px-2 py-1 rounded-full">
        <Lock size={10} /> Locked
      </span>
    </div>
  );
}

function LockedSprintBanner({
  courseId,
  enrollmentId,
  onEnroll,
}: {
  courseId: string;
  enrollmentId?: number;
  onEnroll: () => void;
}) {
  const router = useRouter();

  return (
    <div className="mx-4 mb-3 mt-1 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">This sprint is locked</p>
          <p className="text-xs text-indigo-600 mt-0.5">
            Enroll in the course to access all sprints and course materials.
          </p>
        </div>
      </div>
      <button
        onClick={() => {
          if (enrollmentId) {
            router.push(`/user/payment/${enrollmentId}`);
          } else {
            router.push(`/courses/${courseId}`);
          }
        }}
        className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        {enrollmentId ? 'Complete Payment' : 'Enroll Now'}
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { courseId: queryCourseId } = router.query;

  const [courseId, setCourseId] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [activeTab, setActiveTab] = useState('all-resources');
  const [data, setData] = useState<CourseResourcesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSprints, setExpandedSprints] = useState<number[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentEnrollment, setCurrentEnrollment] = useState<CourseEnrollment | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [initialItemId, setInitialItemId] = useState<number | undefined>(undefined);

  const completingRef = useRef<Set<number>>(new Set());

  // ── Init course ID ─────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      if (queryCourseId) {
        const id = Array.isArray(queryCourseId) ? queryCourseId[0] : queryCourseId;
        setCourseId(id);
      } else {
        try {
          const enrollments = await api.enrollment.getUserEnrollments();
          if (enrollments.enrollments?.length > 0) {
            const courses = enrollments.enrollments.map((e: any) => ({
              course_id: e.course_id,
              course_title: e.course_title || e.course_name || `Course ${e.course_id}`,
              course_name: e.course_name,
            }));
            setEnrolledCourses(courses);
            setCourseId(courses[0].course_id.toString());
          } else {
            setError('You are not enrolled in any courses yet.');
            setLoading(false);
          }
        } catch {
          setError('Failed to fetch enrollments.');
          setLoading(false);
        }
      }
    };
    if (user) init();
  }, [queryCourseId, user]);

  // ── Enrollment status ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const response = await api.enrollment.checkStatus(courseId);
        if (response.enrollment) setCurrentEnrollment(response.enrollment);
      } catch {
        // For freemium courses the user may not be enrolled at all — that's fine.
        // We set a minimal object so the resource page still loads.
        setCurrentEnrollment({ has_access: false } as CourseEnrollment);
      }
    })();
  }, [courseId]);

  // ── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!courseId || currentEnrollment === null) return;
    loadData();
  }, [courseId, currentEnrollment]);

  const loadData = async () => {
    try {
      setLoading(true);

      // For fully-blocked (non-freemium) courses keep existing behaviour
      const isFreemiumCourse = data?.freemium_meta?.is_freemium;
      if (
        currentEnrollment &&
        !currentEnrollment.has_access &&
        !isFreemiumCourse
      ) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }

      const response = await api.courseResources.getAll(courseId!);
      const fresh = response as CourseResourcesData;
      setData(fresh);
      setError(null);

      if (fresh.materials.length > 0) {
        // Auto-expand the first unlocked sprint with incomplete items
        const firstUnlocked = fresh.materials.find(
          (s) => !s.is_locked && s.progress_percentage < 100
        );
        setExpandedSprints([firstUnlocked?.id ?? fresh.materials[0].id]);
      }
    } catch {
      setError('Failed to load course resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh — no spinner, preserves completion state
  const silentRefresh = useCallback(async () => {
    if (!courseId) return;
    // Allow refresh even when user doesn't have full access (freemium preview)
    try {
      const response = await api.courseResources.getAll(courseId);
      const fresh = response as CourseResourcesData;

      setData(prev => {
        if (!prev) return fresh;

        const completedIds = new Set<number>();
        prev.materials.forEach(s =>
          s.items.forEach(i => { if (i.is_completed) completedIds.add(i.id); })
        );

        const mergedMaterials = fresh.materials.map(sprint => ({
          ...sprint,
          items: sprint.items.map(item => ({
            ...item,
            is_completed: completedIds.has(item.id) ? true : item.is_completed,
          })),
        }));

        return { ...fresh, materials: mergedMaterials };
      });

      setExpandedSprints(prev => {
        const existingIds = new Set(prev);
        const newSprintIds = fresh.materials
          .filter(s => !existingIds.has(s.id))
          .map(s => s.id);
        return newSprintIds.length > 0 ? [...prev, ...newSprintIds] : prev;
      });
    } catch {
      // silent
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    const interval = setInterval(() => {
      if (!document.hidden) silentRefresh();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (!document.hidden) silentRefresh();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [courseId, silentRefresh]);

  // ── Auto-complete ──────────────────────────────────────────────────────────

  const handleAutoComplete = useCallback(async (itemId: number) => {
    if (completingRef.current.has(itemId)) return;

    // Don't attempt to complete items inside locked sprints
    const sprint = data?.materials.find(s => s.items.some(i => i.id === itemId));
    if (sprint?.is_locked) return;

    completingRef.current.add(itemId);
    try {
      await api.courseResources.markItemCompleted(itemId);
      setToast({ message: '✓ Progress saved automatically!', type: 'success' });
      setTimeout(() => setToast(null), 2500);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          materials: prev.materials.map(sprint => ({
            ...sprint,
            items: sprint.items.map(item =>
              item.id === itemId ? { ...item, is_completed: true } : item
            ),
          })),
        };
      });
      setTimeout(silentRefresh, 1000);
    } catch {
      // silent fail
    } finally {
      completingRef.current.delete(itemId);
    }
  }, [data, silentRefresh]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toggleSprint = (sprintId: number) => {
    setExpandedSprints(prev =>
      prev.includes(sprintId) ? prev.filter(id => id !== sprintId) : [...prev, sprintId]
    );
  };

  const handleCourseSwitch = (newCourseId: number) => {
    setCourseId(newCourseId.toString());
    setActiveTab('all-resources');
    setExpandedSprints([]);
  };

  const handleDownload = async (itemId: number, title: string) => {
    try {
      const blob = await api.courseResources.downloadMaterial(itemId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = title.split('.').pop() || 'pdf';
      a.download = title.endsWith(`.${ext}`) ? title : `${title}.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setToast({ message: '✓ Download started!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch {
      setToast({ message: 'Failed to download file.', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const openModalAtItem = (itemId: number) => {
    setInitialItemId(itemId);
    setPreviewModalOpen(true);
  };

  const openModalAtTop = () => {
    setInitialItemId(undefined);
    setPreviewModalOpen(true);
  };

  const closeModal = () => {
    setPreviewModalOpen(false);
    setInitialItemId(undefined);
  };

  const getItemColors = (type: string) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      pdf:         { bg: 'bg-red-100',    text: 'text-red-600',    label: 'PDF' },
      document:    { bg: 'bg-orange-100', text: 'text-orange-600', label: 'DOC' },
      video:       { bg: 'bg-purple-100', text: 'text-purple-600', label: 'VID' },
      text:        { bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'TXT' },
      code_editor: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: '</>' },
    };
    return map[type] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: type.slice(0, 3).toUpperCase() };
  };

  const isMaterialsEmpty = !data?.materials || data.materials.length === 0;
  const freemiumMeta = data?.freemium_meta;

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (loading && !data) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading resources…</div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (error) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-2">{error}</div>
            <button onClick={loadData} className="text-purple-600 hover:underline">Try Again</button>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <UserDashboardLayout>
      {/* Fully blocked non-freemium course */}
      {currentEnrollment && !currentEnrollment.has_access && !freemiumMeta?.is_freemium && (
        <AccessBlockedBanner
          enrollment={currentEnrollment}
          onPayNow={() => router.push(`/user/payment/${currentEnrollment.id}`)}
        />
      )}

      <div className="max-w-[1255px] mx-auto px-6 py-8 pt-25">
        {currentEnrollment?.has_access && currentEnrollment?.access_blocked_reason && (
          <PaymentWarningBanner enrollment={currentEnrollment} />
        )}

        {/* Freemium preview banner — shown when user is previewing without full access */}
        {freemiumMeta?.is_freemium && !freemiumMeta.user_has_access && (
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-px">
            <div className="rounded-2xl bg-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    You're in free mode u can only accessing the first {freemiumMeta.free_sprint_limit} sprints for free
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Enroll to unlock all course materials, projects and certificates.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="flex-shrink-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
              >
                Unlock Full Course
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 inline-block">
          <div className="inline-flex border-b border-gray-200">
            {['all-resources', 'progress-ranking', 'certificates'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition capitalize ${
                  activeTab === tab ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Course Switcher */}
        {enrolledCourses.length > 1 && (
          <div className="block mb-6">
            <div className="w-full overflow-x-auto">
              <div className="flex border-b-2 border-gray-400 min-w-max">
                {enrolledCourses.map(course => (
                  <button
                    key={course.course_id}
                    onClick={() => handleCourseSwitch(course.course_id)}
                    className={`px-6 py-4 text-sm font-medium transition whitespace-nowrap ${
                      courseId === course.course_id.toString()
                        ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {course.course_title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── ALL RESOURCES TAB ──────────────────────────────────────────── */}
        {activeTab === 'all-resources' && data && (
          <div>
            {/* Course Materials */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {freemiumMeta?.is_freemium && !freemiumMeta.user_has_access
                      ? `Sprints 1–${freemiumMeta.free_sprint_limit} are free · Remaining sprints require enrollment`
                      : 'Click any item to view or download'}
                  </p>
                </div>
                {/* Learning View button — only when user has access to something */}
                {(freemiumMeta?.user_has_access || freemiumMeta?.is_freemium) && (
                  <button
                    onClick={openModalAtTop}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition"
                  >
                    <BookOpen size={15} /> Learning View
                  </button>
                )}
              </div>

              {isMaterialsEmpty ? (
                <div className="p-12">
                  <div className="text-center max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Materials Yet</h3>
                    <p className="text-gray-600">Your course materials will appear here when the class starts</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {data.materials.map(sprint => {
                    const isLocked = !!sprint.is_locked;

                    return (
                      <div key={sprint.id} className={`border rounded-lg overflow-hidden ${isLocked ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200'}`}>
                        {/* Sprint header */}
                        <button
                          onClick={() => toggleSprint(sprint.id)}
                          className={`w-full flex items-center justify-between p-4 transition ${
                            isLocked
                              ? 'bg-gray-50 cursor-pointer hover:bg-gray-100'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                              isLocked
                                ? 'bg-gray-200 text-gray-400'
                                : sprint.progress_percentage === 100
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isLocked
                                ? <Lock className="w-4 h-4" />
                                : sprint.progress_percentage === 100
                                ? <Check className="w-6 h-6" />
                                : `S${sprint.sprint_number}`
                              }
                            </div>
                            <div className="text-left">
                              <div className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>
                                {sprint.sprint_name}
                                {isLocked && (
                                  <span className="ml-2 text-xs font-normal bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full">
                                    Premium
                                  </span>
                                )}
                                {!isLocked && sprint.sprint_number <= (freemiumMeta?.free_sprint_limit ?? 0) && freemiumMeta?.is_freemium && (
                                  <span className="ml-2 text-xs font-normal bg-green-50 text-green-600 border border-green-100 px-2 py-0.5 rounded-full">
                                    Free Preview
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                {isLocked
                                  ? `${sprint.total_items ?? sprint.items.length} items · Locked`
                                  : `${sprint.completed_items ?? 0} of ${sprint.total_items ?? sprint.items.length} completed (${sprint.progress_percentage}%)`
                                }
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {!isLocked && (
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${sprint.progress_percentage === 100 ? 'bg-green-500' : 'bg-purple-600'}`}
                                  style={{ width: `${sprint.progress_percentage}%` }}
                                />
                              </div>
                            )}
                            {expandedSprints.includes(sprint.id)
                              ? <ChevronUp className="w-5 h-5 text-gray-400" />
                              : <ChevronDown className="w-5 h-5 text-gray-400" />
                            }
                          </div>
                        </button>

                        {/* Sprint items */}
                        {expandedSprints.includes(sprint.id) && (
                          <div className="bg-white">
                            {isLocked ? (
                              <>
                                {/* Show locked placeholder rows */}
                                <div className="divide-y divide-gray-50">
                                  {sortItems(sprint.items).map(item => (
                                    <LockedSprintRow key={item.id} title={item.title} type={item.type} />
                                  ))}
                                </div>
                                {/* Paywall CTA */}
                                <LockedSprintBanner
                                  courseId={courseId!}
                                  enrollmentId={currentEnrollment?.id}
                                  onEnroll={() => router.push(`/courses/${courseId}`)}
                                />
                              </>
                            ) : (
                              sprint.items.length > 0 && (
                                <div className="divide-y divide-gray-100">
                                  {sortItems(sprint.items).map(item => {
                                    const colors = getItemColors(item.type);
                                    const isPdf          = item.type === 'pdf' && !!item.download_url;
                                    const isDoc          = item.type === 'document' && !!item.download_url;
                                    const hasText        = !!item.text_content;
                                    const isCodeExercise = item.type === 'code_editor';
                                    const isClickable    = isPdf || isDoc || hasText || isCodeExercise;

                                    return (
                                      <div
                                        key={item.id}
                                        className={`flex items-center justify-between p-4 transition ${
                                          item.is_completed ? 'bg-green-50/30' : ''
                                        } ${isClickable ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                                        onClick={() => isClickable && openModalAtItem(item.id)}
                                      >
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className={`w-8 h-8 rounded flex items-center justify-center ${colors.bg}`}>
                                            <span className={`text-xs font-bold ${colors.text}`}>{colors.label}</span>
                                          </div>
                                          <div className="flex-1">
                                            <p className={`text-sm font-medium ${isClickable ? 'text-gray-800 hover:text-purple-700' : 'text-gray-800'}`}>
                                              {item.title}
                                            </p>
                                            {item.file_size && <div className="text-xs text-gray-500">{item.file_size}</div>}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {item.is_completed ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                              <CheckCircle size={11} /> Completed
                                            </span>
                                          ) : isCodeExercise ? (
                                            <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium">
                                              ⚡ Exercise
                                            </span>
                                          ) : (
                                            <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                              <Clock size={11} /> Auto-tracks
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            {data.leaderboard && freemiumMeta?.user_has_access && (
              <div className="bg-white rounded-lg border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    Evaluation & Leaderboard
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Your Average Score</div>
                      <div className="text-3xl font-bold text-gray-900">{data.statistics.overall_progress}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Cohort Average</div>
                      <div className="text-3xl font-bold text-gray-900">{data.course_average}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Difference</div>
                      <div className="text-3xl font-bold text-green-600">
                        +{(data.statistics.overall_progress - data.course_average).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data.statistics.overall_progress}%` }} />
                  </div>
                  <div className="overflow-x-auto border-t border-gray-200 pt-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {['Rank', 'Student Name', 'Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4', 'Overall'].map(h => (
                            <th key={h} className="text-left text-xs font-medium text-gray-500 py-3 px-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.leaderboard.participants.map((p, idx) => (
                          <tr key={p.user_id} className={`border-b border-gray-100 ${p.is_current_user ? 'bg-green-50' : ''}`}>
                            <td className="py-3 px-2">
                              {idx === 0
                                ? <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><Trophy className="w-4 h-4 text-yellow-600" /></div>
                                : <div className="text-sm text-gray-600 pl-2">#{p.rank}</div>}
                            </td>
                            <td className="py-3 px-2 text-sm font-medium text-gray-900">{p.user_name}</td>
                            <td className="py-3 px-2 text-center text-sm text-gray-600">{p.sprint1_score}%</td>
                            <td className="py-3 px-2 text-center text-sm text-gray-600">{p.sprint2_score}%</td>
                            <td className="py-3 px-2 text-center text-sm text-gray-600">{p.sprint3_score}%</td>
                            <td className="py-3 px-2 text-center text-sm text-gray-600">{p.sprint4_score}%</td>
                            <td className="py-3 px-2 text-center text-sm font-semibold text-gray-900">{p.overall_score}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* External Resources */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-purple-600" />
                  External Learning Resources
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { label: 'Video Tutorials', items: sortExternal(data.external_resources.video_tutorials) },
                    { label: 'Industry Articles', items: sortExternal(data.external_resources.industry_articles) },
                  ].map(({ label, items }) => (
                    <div key={label}>
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full" /> {label}
                      </h3>
                      <div className="space-y-3">
                        {items.map(r => (
                          <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-gray-50 transition group">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600">{r.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{r.source}{r.duration ? ` · ${r.duration}` : ''}</div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 ml-2 flex-shrink-0" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full" /> Tool Guides
                    </h3>
                    <div className="space-y-3">
                      {sortExternal(data.external_resources.recommended_reading).slice(0, 3).map(r => (
                        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-gray-50 transition group">
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600 flex-1">{r.title}</div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 ml-2 flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full" /> Recommended Reading
                    </h3>
                    <div className="space-y-3">
                      {sortExternal(data.external_resources.recommended_reading).slice(3).map(r => (
                        <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-gray-50 transition group">
                          <div className="flex items-start justify-between">
                            <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600 flex-1">{r.title}</div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 ml-2 flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PROGRESS RANKING TAB ───────────────────────────────────────── */}
        {activeTab === 'progress-ranking' && (
          <div className="text-center py-12 text-gray-600">Progress Ranking coming soon…</div>
        )}

        {/* ─── CERTIFICATES TAB ───────────────────────────────────────────── */}
        {activeTab === 'certificates' && (
          <div>
            {data?.badges?.filter(b => b.is_unlocked).length ? (
              <div className="text-center py-12 text-gray-600">
                You have {data.badges.filter(b => b.is_unlocked).length} badge(s)!
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-6">Complete your first sprint to unlock your achievement badge.</p>
                  <button onClick={() => setActiveTab('all-resources')} className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition">
                    Start Learning
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
            {toast.message}
          </div>
        )}

        {/* Preview Modal — only pass unlocked sprints */}
        {previewModalOpen && (
          <ResourcePreviewModal
            url={null}
            title={null}
            onClose={closeModal}
            sprints={data?.materials}
            initialItemId={initialItemId}
            externalVideos={data?.external_resources?.video_tutorials}
            onMarkComplete={handleAutoComplete}
            onDownload={handleDownload}
            freemiumMeta={freemiumMeta}
            onEnrollClick={() => router.push(`/courses/${courseId}`)}
            onPayNowClick={currentEnrollment?.id
              ? () => router.push(`/user/payment/${currentEnrollment!.id}`)
              : undefined
            }
            onPreviewFile={async (itemId, title) => {
              const lowerTitle = title.toLowerCase();
              const isOffice =
                lowerTitle.endsWith('.docx') || lowerTitle.endsWith('.doc') ||
                lowerTitle.endsWith('.pptx') || lowerTitle.endsWith('.ppt') ||
                lowerTitle.endsWith('.xlsx') || lowerTitle.endsWith('.xls');

              if (isOffice) {
                const { url } = await api.courseResources.getPreviewUrl(itemId);
                return url;
              }

              const blob = await api.courseResources.downloadMaterial(itemId);
              return window.URL.createObjectURL(blob);
            }}
          />
        )}
      </div>
    </UserDashboardLayout>
  );
}