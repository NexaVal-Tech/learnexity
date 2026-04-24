import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, ExternalLink, ChevronDown, ChevronUp, Trophy, Award, BookOpen, Check, CheckCircle, Clock } from 'lucide-react';
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
  file_size?: string | null;
  download_url?: string | null;
  is_completed?: boolean;
  text_content?: string | null;
}

interface Sprint {
  id: number;
  sprint_number: number;
  sprint_name: string;
  progress_percentage: number;
  completed_items?: number;
  total_items?: number;
  items: CourseResourceItem[];
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
}

interface EnrolledCourse {
  course_id: number;
  course_title: string;
  course_name?: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

function saveLastCourseId(id: string) {
  try { localStorage.setItem('rp_last_course', id); } catch {}
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Track which items are currently being auto-completed (debounce API calls)
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
        setCurrentEnrollment({ has_access: true } as CourseEnrollment);
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
      if (currentEnrollment && !currentEnrollment.has_access) {
        setData(null); setError(null); setLoading(false); return;
      }
      const response = await api.courseResources.getAll(courseId!);
      setData(response as CourseResourcesData);
      setError(null);

      // Auto-expand first sprint with uncompleted items
      const materials = (response as CourseResourcesData).materials;
      if (materials.length > 0) {
        const firstUncompleted = materials.find(s => s.progress_percentage < 100);
        setExpandedSprints([firstUncompleted?.id ?? materials[0].id]);
      }
    } catch {
      setError('Failed to load course resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Auto-progress tracking ─────────────────────────────────────────────────
  // Called from ResourcePreviewModal when a topic is auto-completed.
  // Also exposed to the list view for items the user interacts with.

  const handleAutoComplete = useCallback(async (itemId: number) => {
    if (completingRef.current.has(itemId)) return;
    completingRef.current.add(itemId);
    try {
      await api.courseResources.markItemCompleted(itemId);
      setToast({ message: '✓ Progress saved automatically!', type: 'success' });
      setTimeout(() => setToast(null), 2500);
      // Optimistic UI update
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
      // Refresh full data in background
      setTimeout(loadData, 1000);
    } catch {
      // Silent fail — don't bother user with auto-tracking errors
    } finally {
      completingRef.current.delete(itemId);
    }
  }, [courseId, currentEnrollment]);

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

  const isMaterialsEmpty = !data?.materials || data.materials.length === 0;

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
      {currentEnrollment && !currentEnrollment.has_access && (
        <AccessBlockedBanner
          enrollment={currentEnrollment}
          onPayNow={() => router.push(`/user/payment/${currentEnrollment.id}`)}
        />
      )}

      <div className="max-w-[1541px] mx-auto px-6 py-8 pt-25">
        {currentEnrollment?.has_access && currentEnrollment?.access_blocked_reason && (
          <PaymentWarningBanner enrollment={currentEnrollment} />
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
            {/* Open Full Preview Button */}
            {/* <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
              >
                <BookOpen size={16} /> Open Learning View
              </button>
            </div> */}

            {/* Auto-tracking notice */}
            {/* <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
              <Clock size={14} className="flex-shrink-0" />
              <span>Progress is tracked automatically — just read and watch. No need to mark anything manually.</span>
            </div> */}

            {/* Course Materials */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
                <p className="text-sm text-gray-500 mt-1">Organized by sprint — expand to view content</p>
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
                  {data.materials.map(sprint => (
                    <div key={sprint.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSprint(sprint.id)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                            sprint.progress_percentage === 100 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {sprint.progress_percentage === 100 ? <Check className="w-6 h-6" /> : `S${sprint.sprint_number}`}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{sprint.sprint_name}</div>
                            <div className="text-xs text-gray-500">
                              {sprint.completed_items ?? 0} of {sprint.total_items ?? sprint.items.length} completed ({sprint.progress_percentage}%)
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${sprint.progress_percentage === 100 ? 'bg-green-500' : 'bg-purple-600'}`}
                              style={{ width: `${sprint.progress_percentage}%` }}
                            />
                          </div>
                          {expandedSprints.includes(sprint.id)
                            ? <ChevronUp className="w-5 h-5 text-gray-400" />
                            : <ChevronDown className="w-5 h-5 text-gray-400" />
                          }
                        </div>
                      </button>

                      {expandedSprints.includes(sprint.id) && sprint.items.length > 0 && (
                        <div className="bg-white divide-y divide-gray-100">
                          {sprint.items.map(item => (
                            <div key={item.id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition ${item.is_completed ? 'bg-green-50/30' : ''}`}>
                              <div className="flex items-center gap-3 flex-1">
                                {/* Completion indicator (read-only — auto-tracked) */}
                                {/* <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                                  item.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-200 bg-white'
                                }`}>
                                  {item.is_completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                                </div> */}

                                <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                  item.type === 'pdf' ? 'bg-red-100' :
                                  item.type === 'document' ? 'bg-orange-100' :
                                  item.type === 'video' ? 'bg-purple-100' : 'bg-blue-100'
                                }`}>
                                  <span className={`text-xs font-bold ${
                                    item.type === 'pdf' ? 'text-red-600' :
                                    item.type === 'document' ? 'text-orange-600' :
                                    item.type === 'video' ? 'text-purple-600' : 'text-blue-600'
                                  }`}>
                                    {item.type === 'pdf' ? 'PDF' :
                                     item.type === 'document' ? 'DOC' :
                                     item.type === 'video' ? 'VID' : 'TXT'}
                                  </span>
                                </div>

                                <div className="flex-1">
                                  <button
                                    onClick={() => setShowPreviewModal(true)}
                                    className="text-sm font-medium text-gray-800 hover:text-purple-700 text-left transition"
                                  >
                                    {item.title}
                                  </button>
                                  {item.file_size && <div className="text-xs text-gray-500">{item.file_size}</div>}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                {item.is_completed ? (
                                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle size={11} /> Completed
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                    <Clock size={11} /> Auto-tracks
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard */}
            {data.leaderboard && (
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
                              {idx === 0 ? <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center"><Trophy className="w-4 h-4 text-yellow-600" /></div>
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
                    { label: 'Video Tutorials', items: data.external_resources.video_tutorials },
                    { label: 'Industry Articles', items: data.external_resources.industry_articles },
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
                      {data.external_resources.recommended_reading.slice(0, 3).map(r => (
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
                      {data.external_resources.recommended_reading.slice(3).map(r => (
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

        {/* Preview Modal */}
        {showPreviewModal && (
          <ResourcePreviewModal
            url={null}
            title={null}
            onClose={() => setShowPreviewModal(false)}
            sprints={data?.materials}
            externalVideos={data?.external_resources?.video_tutorials}
            onMarkComplete={handleAutoComplete}
            onDownload={handleDownload}
            onPreviewFile={async (itemId, _title) => {
              const blob = await api.courseResources.downloadMaterial(itemId);
              return window.URL.createObjectURL(blob);
            }}
          />
        )}
      </div>
    </UserDashboardLayout>
  );
}