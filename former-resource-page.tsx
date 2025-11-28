import React, { useState, useEffect } from 'react';
import { Download, ExternalLink, ChevronDown, ChevronUp, Trophy, Clock, TrendingUp, Award, Share2, Link2 } from 'lucide-react';
import UserDashboardLayout from './UserDashboardLayout';
import { api } from '@/lib/api';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';


// -------------------------
// TypeScript interfaces
// -------------------------
interface CourseResourceItem {
  id: number;
  title: string;
  type: string;
  file_size?: string | null;
  download_url?: string | null;
  completed?: boolean | null;
}

interface Sprint {
  id: number;
  sprint_number: number;
  sprint_name: string;
  progress_percentage: number;
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
  statistics: {
    overall_progress: number;
  };
  course_average: number;
  leaderboard: {
    participants: LeaderboardParticipant[];
  };
  external_resources: {
    video_tutorials: ExternalResource[];
    industry_articles: ExternalResource[];
    recommended_reading: ExternalResource[];
  };
  badges: { id: number; is_unlocked: boolean }[];
}

export default function ResourcesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { courseId: queryCourseId } = router.query;
  
  const [courseId, setCourseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all-resources');
  const [data, setData] = useState<CourseResourcesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSprints, setExpandedSprints] = useState<number[]>([1]);

  // Get courseId from query or fetch user's first enrolled course
  useEffect(() => {
    const initializeCourseId = async () => {
      if (queryCourseId) {
        // Handle the case where queryCourseId might be an array
        const id = Array.isArray(queryCourseId) ? queryCourseId[0] : queryCourseId;
        setCourseId(id);
      } else {
        try {
          const enrollments = await api.enrollment.getUserEnrollments();
          if (enrollments.enrollments && enrollments.enrollments.length > 0) {
            setCourseId(enrollments.enrollments[0].course_id.toString());
          } else {
            setError('You are not enrolled in any courses yet.');
            setLoading(false);
          }
        } catch (err) {
          setError('Failed to fetch enrollments.');
          setLoading(false);
        }
      }
    };

    if (user) {
      initializeCourseId();
    }
  }, [queryCourseId, user]);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.courseResources.getAll(courseId!);
      setData(response as CourseResourcesData);
      setError(null);
    } catch (err) {
      setError('Failed to load course resources. Please try again.');
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSprint = (sprintId: number) => {
    setExpandedSprints(prev =>
      prev.includes(sprintId) ? prev.filter(id => id !== sprintId) : [...prev, sprintId]
    );
  };

  const handleItemToggle = async (itemId: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await api.courseResources.markItemIncomplete(itemId);
      } else {
        await api.courseResources.markItemCompleted(itemId);
      }
      await loadData();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDownload = async (itemId: number, title: string) => {
    try {
      const blob = await api.courseResources.downloadMaterial(itemId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download:', error);
    }
  };

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading resources...</div>
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
            <button onClick={loadData} className="text-purple-600 hover:underline">
              Try Again
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-[1541px] mx-auto px-6 py-8 pt-25">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6 w-120">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('all-resources')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'all-resources'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Resources
            </button>
            <button
              onClick={() => setActiveTab('progress-ranking')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'progress-ranking'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Progress Ranking
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`px-6 py-3 text-sm font-medium transition ${
                activeTab === 'certificates'
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Certificates
            </button>
          </div>
        </div>

        {/* All Resources Tab */}
        {activeTab === 'all-resources' && data && (
          <div>
            {/* Course Materials */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
                <p className="text-sm text-gray-500 mt-1">Downloadable PDFs, templates, and presentations organized by sprint</p>
              </div>
              <div className="p-6 space-y-4">
                {data.materials.map(sprint => (
                  <div key={sprint.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSprint(sprint.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                          sprint.progress_percentage === 100 ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                          Sprint {sprint.sprint_number}
                        </div>
                        <span className="font-medium text-gray-900">{sprint.sprint_name}</span>
                      </div>
                      {expandedSprints.includes(sprint.id) ? 
                        <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      }
                    </button>
                    {expandedSprints.includes(sprint.id) && sprint.items.length > 0 && (
                      <div className="bg-white divide-y divide-gray-100">
                        {sprint.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                item.type === 'pdf' ? 'bg-red-100' : 
                                item.type === 'document' ? 'bg-orange-100' : 
                                item.type === 'video' ? 'bg-purple-100' : 'bg-green-100'
                              }`}>
                                {item.type === 'pdf' && <span className="text-red-600 text-xs font-bold">PDF</span>}
                                {item.type === 'document' && <span className="text-orange-600 text-xs font-bold">DOC</span>}
                                {item.type === 'video' && <span className="text-purple-600 text-xs font-bold">VID</span>}
                                {item.type === 'link' && <span className="text-green-600 text-xs font-bold">LNK</span>}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 text-sm">{item.title}</div>
                                <div className="text-xs text-gray-500">{item.file_size}</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => item.download_url && handleDownload(item.id, item.title)}
                              className="px-4 py-2 text-sm text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition flex items-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Evaluation & Leaderboard */}
            <div className="bg-white rounded-lg border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  Evaluation & Leaderboard
                </h2>
                <p className="text-sm text-gray-500 mt-1">Real-time performance tracking and cohort rankings</p>
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
                    <div className="text-3xl font-bold text-green-600">+{(data.statistics.overall_progress - data.course_average).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="text-sm text-gray-700 mb-2">You're performing {((data.statistics.overall_progress - data.course_average) / data.course_average * 100).toFixed(1)}% above the cohort average</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div className="bg-green-500 h-2 rounded-full transition-all" style={{ width: `${data.statistics.overall_progress}%` }}></div>
                </div>

                {data.leaderboard && (
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Cohort Leaderboard</h3>
                      <button className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        Open in Google Sheets
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left text-xs font-medium text-gray-500 py-3 px-2">Rank</th>
                            <th className="text-left text-xs font-medium text-gray-500 py-3 px-2">Student Name</th>
                            <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Sprint 1</th>
                            <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Sprint 2</th>
                            <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Sprint 3</th>
                            <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Sprint 4</th>
                            <th className="text-center text-xs font-medium text-gray-500 py-3 px-2">Overall</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.leaderboard.participants.map((participant, index) => (
                            <tr
                              key={participant.user_id}
                              className={`border-b border-gray-100 ${participant.is_current_user ? 'bg-green-50' : ''}`}
                            >
                              <td className="py-3 px-2">
                                {index === 0 ? (
                                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                                    <Trophy className="w-4 h-4 text-yellow-600" />
                                  </div>
                                ) : index === 1 ? (
                                  <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full">
                                    <span className="text-sm font-bold text-gray-600">#{participant.rank}</span>
                                  </div>
                                ) : index === 2 ? (
                                  <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                                    <span className="text-sm font-bold text-orange-600">#{participant.rank}</span>
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-600 pl-2">#{participant.rank}</div>
                                )}
                              </td>
                              <td className="py-3 px-2 text-sm font-medium text-gray-900">{participant.user_name}</td>
                              <td className="py-3 px-2 text-center text-sm text-gray-600">{participant.sprint1_score}%</td>
                              <td className="py-3 px-2 text-center text-sm text-gray-600">{participant.sprint2_score}%</td>
                              <td className="py-3 px-2 text-center text-sm text-gray-600">{participant.sprint3_score}%</td>
                              <td className="py-3 px-2 text-center text-sm text-gray-600">{participant.sprint4_score}%</td>
                              <td className="py-3 px-2 text-center text-sm font-semibold text-gray-900">{participant.overall_score}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* External Learning Resources */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-purple-600" />
                  External Learning Resources
                </h2>
                <p className="text-sm text-gray-500 mt-1">Curated videos, articles, tutorials, and recommended reading</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Video Tutorials */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Video Tutorials
                    </h3>
                    <div className="space-y-3">
                      {data.external_resources.video_tutorials.map(resource => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg hover:bg-gray-50 transition group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600">{resource.title}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="mr-2">▷ {resource.source}</span>
                                <span>• {resource.duration}</span>
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 ml-2 flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Industry Articles */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Industry Articles
                    </h3>
                    <div className="space-y-3">
                      {data.external_resources.industry_articles.map(resource => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg hover:bg-gray-50 transition group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600">{resource.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{resource.source}</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 ml-2 flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tool Guides & Recommended Reading */}
                <div className="grid grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Tool Guides
                    </h3>
                    <div className="space-y-3">
                      {data.external_resources.recommended_reading.slice(0, 3).map(resource => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg hover:bg-gray-50 transition group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600">{resource.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{resource.source}</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-purple-600 ml-2 flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      Recommended Reading
                    </h3>
                    <div className="space-y-3">
                      {data.external_resources.recommended_reading.slice(3).map(resource => (
                        <a
                          key={resource.id}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 rounded-lg hover:bg-gray-50 transition group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm group-hover:text-purple-600">{resource.title}</div>
                              <div className="text-xs text-gray-500 mt-1">{resource.source}</div>
                            </div>
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

        {/* Progress Ranking Tab */}
        {activeTab === 'progress-ranking' && data && (
          <div>
            <div className="text-center py-12">
              <p className="text-gray-600">Progress Ranking tab content coming soon...</p>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div>
            {data && data.badges && data.badges.filter(b => b.is_unlocked).length > 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">You have {data.badges.filter(b => b.is_unlocked).length} badges!</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Complete your first sprint to unlock your achievement badge. Keep learning to earn more certificates!
                  </p>
                  <button
                    onClick={() => setActiveTab('all-resources')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition"
                  >
                    Start Learning
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}