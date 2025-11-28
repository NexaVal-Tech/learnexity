import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import { 
  ArrowLeft, Plus, Edit, Trash, GripVertical, 
  ChevronDown, ChevronUp, FileText, Video, Link as LinkIcon, X, Upload, Download, Eye,
  Users, CheckCircle, TrendingUp, BarChart2, Mail, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import ComposeMessageModal from '@/components/admin/students/ComposeMessageModal';

const CourseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('Sprints');

  // Mock Data
  const course = {
    name: 'Web Development',
    instructor: 'Sarah Chen',
    sprintsCount: 12,
    weeksCount: 12,
  };

  const sprints = [
    {
      id: 1,
      number: 1,
      week: 1,
      title: 'Introduction to Product Management',
      topics: [
        { id: 1, title: 'What is Product Management?', type: 'video' },
        { id: 2, title: 'Product Manager Role & Responsibilities', type: 'doc' },
        { id: 3, title: 'Product Lifecycle Overview', type: 'doc' },
        { id: 4, title: 'Market Research Fundamentals', type: 'doc' },
      ]
    },
    {
      id: 2,
      number: 2,
      week: 2,
      title: 'Product Strategy & Planning',
      topics: [
        { id: 5, title: 'Strategic Thinking for PMs', type: 'video' },
        { id: 6, title: 'Competitive Analysis Techniques', type: 'doc' },
        { id: 7, title: 'Product Roadmapping', type: 'doc' },
        { id: 8, title: 'Stakeholder Management', type: 'doc' },
      ]
    },
    {
      id: 3,
      number: 3,
      week: 3,
      title: 'User Research & Validation',
      topics: [
        { id: 9, title: 'User Interview Techniques', type: 'video' },
        { id: 10, title: 'Survey Design & Analysis', type: 'doc' },
        { id: 11, title: 'Prototype Testing', type: 'doc' },
        { id: 12, title: 'Data-Driven Decision Making', type: 'doc' },
      ]
    },
    {
      id: 4,
      number: 4,
      week: 4,
      title: 'Product Development Process',
      topics: [
        { id: 13, title: 'Agile Methodology for PMs', type: 'video' },
        { id: 14, title: 'Working with Engineering Teams', type: 'doc' },
        { id: 15, title: 'Feature Prioritization Frameworks', type: 'doc' },
        { id: 16, title: 'Quality Assurance & Testing', type: 'doc' },
      ]
    },
    {
      id: 5,
      number: 5,
      week: 5,
      title: 'Product Launch & Growth',
      topics: [
        { id: 17, title: 'Go-to-Market Strategy', type: 'video' },
        { id: 18, title: 'Launch Planning & Execution', type: 'doc' },
        { id: 19, title: 'Metrics & KPI Tracking', type: 'doc' },
        { id: 20, title: 'Growth Hacking Techniques', type: 'doc' },
      ]
    },
    {
      id: 6,
      number: 6,
      week: 6,
      title: 'Advanced Product Management',
      topics: [
        { id: 21, title: 'Product Portfolio Management', type: 'video' },
        { id: 22, title: 'Pricing Strategies', type: 'doc' },
        { id: 23, title: 'International Product Expansion', type: 'doc' },
        { id: 24, title: 'Career Development for PMs', type: 'doc' },
      ]
    }
  ];

  const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
  const [isAddSprintModalOpen, setIsAddSprintModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<any>(null);

  const handleEditSprint = (sprint: any) => {
    setSelectedSprint(sprint);
    setIsEditSprintModalOpen(true);
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

  return (
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
                <span>{course.sprintsCount} Sprints</span>
                <span>•</span>
                <span>{course.weeksCount} weeks</span>
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
            {sprints.map((sprint) => (
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
                    <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
            ))}
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

            <div className="mb-6">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
                Sprint 1
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
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
                  {[
                    { id: 1, name: 'Product Management Guide.pdf', type: 'PDF', sprint: 'Sprint 1', size: '2.5 MB', access: 'Downloadable', date: '2024-10-01' },
                    { id: 2, name: 'Agile Methodology.docx', type: 'DOCUMENT', sprint: 'Sprint 4', size: '1.2 MB', access: 'View Only', date: '2024-10-05' },
                    { id: 3, name: 'Stakeholder Template.xlsx', type: 'TEMPLATE', sprint: 'Sprint 2', size: '850 KB', access: 'Downloadable', date: '2024-10-08' },
                  ].map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <GripVertical size={16} className="text-gray-300" />
                          <FileText size={18} className="text-red-500" />
                          <span className="text-sm font-medium text-gray-900">{material.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">{material.type}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{material.sprint}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{material.size}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          {material.access === 'Downloadable' ? <Download size={14} className="text-green-500" /> : <Eye size={14} className="text-blue-500" />}
                          {material.access}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 whitespace-nowrap">{material.date}</td>
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

            {/* Mobile List */}
            <div className="md:hidden space-y-4">
              {[
                { id: 1, name: 'Product Management Guide.pdf', type: 'PDF', sprint: 'Sprint 1', size: '2.5 MB', access: 'Downloadable', date: '2024-10-01' },
                { id: 2, name: 'Agile Methodology.docx', type: 'DOCUMENT', sprint: 'Sprint 4', size: '1.2 MB', access: 'View Only', date: '2024-10-05' },
                { id: 3, name: 'Stakeholder Template.xlsx', type: 'TEMPLATE', sprint: 'Sprint 2', size: '850 KB', access: 'Downloadable', date: '2024-10-08' },
              ].map((material) => (
                <div key={material.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <GripVertical size={16} className="text-gray-300" />
                      <FileText size={18} className="text-red-500" />
                      <span className="text-sm font-medium text-gray-900">{material.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-red-400 hover:text-red-600">
                        <Trash size={16} />
                      </button>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="space-y-2 pl-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium text-gray-900">{material.type}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sprint</span>
                      <span className="font-medium text-gray-900">{material.sprint}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Size</span>
                      <span className="font-medium text-gray-900">{material.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Access</span>
                      <div className="flex items-center gap-1.5">
                        {material.access === 'Downloadable' ? <Download size={14} className="text-green-500" /> : <Eye size={14} className="text-blue-500" />}
                        <span className="font-medium text-gray-900">{material.access}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Upload Date</span>
                      <span className="font-medium text-gray-900">{material.date}</span>
                    </div>
                  </div>
                </div>
              ))}
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
              {[
                { id: 1, title: 'Introduction to Product Management', type: 'video', platform: 'YouTube', url: 'https://www.youtube.com/watch?v=example', date: '2024-10-01' },
                { id: 2, title: 'Agile Methodology for PMs', type: 'document', platform: null, url: 'https://www.atlassian.com/agile/methodology', date: '2024-10-05' },
                { id: 3, title: 'Product Strategy Deep Dive', type: 'video', platform: 'Vimeo', url: 'https://vimeo.com/example', date: '2024-10-10' },
              ].map((resource) => (
                <div key={resource.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      {resource.type === 'video' ? <Video size={20} /> : <FileText size={20} />}
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
                        <LinkIcon size={12} />
                        {resource.url}
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
              {[
                { label: 'Total Enrollments', value: '4', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Students', value: '2', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Avg. Progress', value: '40%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Payment Rate', value: '50%', icon: BarChart2, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sprint Completion Rates */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Sprint Completion Rates</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { sprint: '1', completion: 85 },
                      { sprint: '2', completion: 72 },
                      { sprint: '3', completion: 68 },
                      { sprint: '4', completion: 45 },
                      { sprint: '5', completion: 30 },
                      { sprint: '6', completion: 15 },
                    ]} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="sprint" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 12 }} 
                        dy={10}
                        label={{ value: 'Sprint', position: 'insideBottom', offset: -10, fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6B7280', fontSize: 12 }} 
                        label={{ value: 'Completion %', angle: -90, position: 'insideLeft', offset: 0, fill: '#6B7280', fontSize: 12, style: { textAnchor: 'middle' } }}
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
                        data={[
                          { name: '0-25%', value: 15, color: '#EF4444' },
                          { name: '51-75%', value: 45, color: '#3B82F6' },
                          { name: '26-50%', value: 28, color: '#F59E0B' },
                          { name: '76-100%', value: 68, color: '#10B981' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={0}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, color }) => {
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
                        {[
                          { name: '0-25%', value: 15, color: '#EF4444' },
                          { name: '51-75%', value: 45, color: '#3B82F6' },
                          { name: '26-50%', value: 28, color: '#F59E0B' },
                          { name: '76-100%', value: 68, color: '#10B981' },
                        ].map((entry, index) => (
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
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
                      All Payments
                      <ChevronDown size={16} />
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100">
                      All Students
                      <ChevronDown size={16} />
                    </button>
                  </div>
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
              <div className="hidden md:block overflow-x-auto">
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
                    {[
                      { name: 'John Doe', email: 'john.doe@example.com', payment: 'Paid', activity: 'Active', progress: 75, date: '2024-09-01' },
                      { name: 'Jane Smith', email: 'jane.smith@example.com', payment: 'Pending', activity: 'Active', progress: 50, date: '2024-09-05' },
                      { name: 'Michael Johnson', email: 'michael.j@example.com', payment: 'Paid', activity: 'Inactive', progress: 25, date: '2024-09-10' },
                      { name: 'Emily Brown', email: 'emily.brown@example.com', payment: 'Overdue', activity: 'Inactive', progress: 10, date: '2024-09-15' },
                    ].map((student, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            student.payment === 'Paid' ? 'bg-green-100 text-green-700' :
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

              {/* Mobile List */}
              <div className="md:hidden space-y-4">
                {[
                  { name: 'John Doe', email: 'john.doe@example.com', payment: 'Paid', activity: 'Active', progress: 75, date: '2024-09-01' },
                  { name: 'Jane Smith', email: 'jane.smith@example.com', payment: 'Pending', activity: 'Active', progress: 50, date: '2024-09-05' },
                  { name: 'Michael Johnson', email: 'michael.j@example.com', payment: 'Paid', activity: 'Inactive', progress: 25, date: '2024-09-10' },
                  { name: 'Emily Brown', email: 'emily.brown@example.com', payment: 'Overdue', activity: 'Inactive', progress: 10, date: '2024-09-15' },
                ].map((student, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Student Name</div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                      </div>
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                    
                    <div className="space-y-3 pl-2 border-l-2 border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Email</div>
                        <div className="text-sm text-gray-600">{student.email}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Payment Status</div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            student.payment === 'Paid' ? 'bg-green-100 text-green-700' :
                            student.payment === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {student.payment}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">Activity Status</div>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            student.activity === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {student.activity}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Progress</div>
                        <div className="flex items-center gap-2">
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-900 rounded-full" style={{ width: `${student.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{student.progress}%</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                        <span className="text-xs text-gray-500">Enrolled Date</span>
                        <span className="text-sm font-medium text-gray-900">{student.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isEditSprintModalOpen && <EditSprintModal />}
        {isAddSprintModalOpen && <AddSprintModal />}
        <ComposeMessageModal 
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          recipientCount={3}
          recipients={['Alice Johnson', 'Carol White', 'Henry Taylor']}
        />
      </div>
    </AdminLayout>
  );
};

export default CourseDetail;
