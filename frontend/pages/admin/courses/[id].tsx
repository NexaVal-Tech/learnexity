import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { 
  ArrowLeft, Plus, Edit, Trash, GripVertical, 
  ChevronDown, X, Upload, Download, Eye, Users, Mail, Filter, Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import ComposeMessageModal from '@/components/admin/students/ComposeMessageModal';
import { api, AdminCourseDetail } from '@/lib/api';

const CourseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('Sprints');
  const [courseData, setCourseData] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
  const [isAddSprintModalOpen, setIsAddSprintModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const data = await api.admin.courses.getById(id as string);
      setCourseData(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSprint = (sprint: any) => {
    setSelectedSprint(sprint);
    setIsEditSprintModalOpen(true);
  };

  const handleDeleteSprint = async (sprintId: number) => {
    if (!confirm('Are you sure you want to delete this sprint?')) return;
    
    try {
      await api.admin.courses.deleteSprint(id as string, sprintId);
      fetchCourseDetails();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete sprint');
    }
  };

  const EditSprintModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Edit Sprint</h2>
          <button 
            onClick={() => setIsEditSprintModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Update sprint information</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Title</label>
            <input 
              type="text" 
              defaultValue={selectedSprint?.title}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Introduction to Product Management"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => setIsEditSprintModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2">
              <Plus size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AddSprintModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Add New Sprint</h2>
          <button 
            onClick={() => setIsAddSprintModalOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">Create a new sprint for this course</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Title</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Advanced Patterns"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              onClick={() => setIsAddSprintModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2">
              <Plus size={16} />
              Create Sprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminRouteGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  if (!courseData) {
    return (
      <AdminRouteGuard>
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-96">
            <p className="text-red-500 mb-4">Course not found</p>
            <button 
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Go Back
            </button>
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  const { course, sprints, materials, external_resources, statistics, students, chart_data } = courseData;

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 p-6">
          {/* Header */}
          <div className="mb-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>Instructor: {course.instructor}</span>
                  <span>•</span>
                  <span>{course.sprints_count} Sprints</span>
                  <span>•</span>
                  <span>{course.weeks_count} weeks</span>
                </div>
              </div>
              <button 
                onClick={() => setIsAddSprintModalOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus size={18} />
                Add Sprint
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
            {['Sprints', 'Course Materials', 'External Resources', 'Course Details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                  activeTab === tab 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'Sprints' && (
            <div className="space-y-6">
              {sprints.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No sprints available. Click "Add Sprint" to create one.
                </div>
              ) : (
                sprints.map((sprint) => (
                  <div key={sprint.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Sprint Header */}
                    <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg cursor-move">
                          <GripVertical size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                              Sprint {sprint.number}
                            </span>
                            <span className="text-xs text-gray-500">Week {sprint.week}</span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900">{sprint.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditSprint(sprint)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSprint(sprint.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Topics List */}
                    <div className="p-4 bg-gray-50/50 space-y-2">
                      {sprint.topics.map((topic) => (
                        <div key={topic.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-gray-50 rounded text-gray-400">
                              <GripVertical size={14} />
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span className="text-sm text-gray-700">{topic.title}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                              <Edit size={14} />
                            </button>
                            <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-dashed border-gray-300 hover:border-gray-400 mt-4">
                        <Plus size={16} />
                        Add Topic
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'Course Materials' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Course Materials Management</h2>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  <Upload size={18} />
                  Upload Material
                </button>
              </div>

              {/* Materials Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Material Name</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Sprint</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Access</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Upload Date</th>
                      <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.map((material) => (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{material.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">
                            {material.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.sprint}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.size}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.access}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.upload_date}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                              <Edit size={16} />
                            </button>
                            <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'External Resources' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">External Resources Management</h2>
                </div>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  <Plus size={18} />
                  Add Resource
                </button>
              </div>

              <div className="space-y-4">
                {external_resources.map((resource) => (
                  <div key={resource.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        {resource.type === 'video' ? '🎥' : '📄'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-900">{resource.title}</h3>
                          {resource.platform && (
                            <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-medium text-gray-600">
                              {resource.platform}
                            </span>
                          )}
                        </div>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-1">
                          🔗 {resource.url}
                        </a>
                        <p className="text-xs text-gray-500">Added: {resource.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-start">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Course Details' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Total Enrollments</span>
                    <div className="p-2 rounded-lg bg-blue-50">
                      <Users size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.total_enrollments}</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Active Students</span>
                    <div className="p-2 rounded-lg bg-green-50">
                      <Users size={20} className="text-green-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.active_students}</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Avg. Progress</span>
                    <div className="p-2 rounded-lg bg-purple-50">
                      <Users size={20} className="text-purple-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.avg_progress}%</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Payment Rate</span>
                    <div className="p-2 rounded-lg bg-orange-50">
                      <Users size={20} className="text-orange-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.payment_rate}%</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sprint Completion Rates */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Sprint Completion Rates</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart_data.sprint_completion} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="sprint" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6B7280', fontSize: 12 }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#6B7280', fontSize: 12 }} 
                        />
                        <RechartsTooltip 
                          cursor={{ fill: '#F3F4F6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Bar dataKey="completion" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Progress Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Distribution</h3>
                  <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chart_data.progress_distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={80}
                          paddingAngle={0}
                          dataKey="value"
                          label={({ cx, cy, midAngle, outerRadius, name, value, color }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = outerRadius + 25;
                            const angle = midAngle ?? 0;
                            const x = cx + radius * Math.cos(-angle * RADIAN);
                            const y = cy + radius * Math.sin(-angle * RADIAN);
                            
                            return (
                              <text 
                                x={x} 
                                y={y} 
                                fill={color} 
                                textAnchor={x > cx ? 'start' : 'end'} 
                                dominantBaseline="central"
                                className="text-xs font-medium"
                              >
                                {`${name}: ${value}`}
                              </text>
                            );
                          }}
                        >
                          {chart_data.progress_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Student List */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Student List</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => setIsMessageModalOpen(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      <Mail size={18} />
                      Send Message
                    </button>
                  </div>
                </div>

                {/* Desktop Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Student Name</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Activity Status</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">Progress</th>
                        <th className="py-3 px-4 text-xs font-medium text-gray-500 uppercase text-right">Enrolled Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              student.payment === 'Completed' ? 'bg-green-100 text-green-700' :
                              student.payment === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {student.payment}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              student.activity === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {student.activity}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-900 rounded-full" style={{ width: `${student.progress}%` }} />
                              </div>
                              <span className="text-xs text-gray-600">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{student.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {isEditSprintModalOpen && <EditSprintModal />}
          {isAddSprintModalOpen && <AddSprintModal />}
          <ComposeMessageModal 
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            recipientCount={students.length}
            recipients={students.map(s => s.name).slice(0, 3)}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default CourseDetail;