import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import { ArrowLeft, Plus, Edit, Trash, GripVertical, X, Upload, Loader2, AlertCircle} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,  PieChart, Pie, Cell } from 'recharts';
import ComposeMessageModal from '@/components/admin/students/ComposeMessageModal';
import { api, handleApiError } from '@/lib/api';
import type { 
  AdminCourseDetail,
  AdminCourseSprint,
  AdminCourseTopic
} from '@/lib/types';

const CourseDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('Sprints');
  const [courseData, setCourseData] = useState<AdminCourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isEditSprintModalOpen, setIsEditSprintModalOpen] = useState(false);
  const [isAddSprintModalOpen, setIsAddSprintModalOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);
  const [isEditTopicModalOpen, setIsEditTopicModalOpen] = useState(false);
  const [isUploadMaterialModalOpen, setIsUploadMaterialModalOpen] = useState(false);
  const [isAddResourceModalOpen, setIsAddResourceModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Form states
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      fetchCourseDetails();
    }
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.admin.courses.getById(id as string);
      setCourseData(data);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Sprint Management
  const handleAddSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.admin.courses.createSprint(id as string, {
        sprint_name: formData.sprint_name,
        sprint_number: parseInt(formData.sprint_number),
        order: parseInt(formData.order || '0'),
      });
      setIsAddSprintModalOpen(false);
      setFormData({});
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint) return;
    
    try {
      setSubmitting(true);
      await api.admin.courses.updateSprint(id as string, selectedSprint.id, {
        sprint_name: formData.sprint_name,
        sprint_number: parseInt(formData.sprint_number),
      });
      setIsEditSprintModalOpen(false);
      setSelectedSprint(null);
      setFormData({});
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    if (!confirm('Are you sure you want to delete this sprint? This will also delete all associated topics.')) return;
    
    try {
      await api.admin.courses.deleteSprint(id as string, sprintId);
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    }
  };

  // Topic Management
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint) return;
    
    try {
      setSubmitting(true);
      await api.admin.courses.createTopic(id as string, selectedSprint.id, {
        title: formData.title,
        type: formData.type || 'document',
        file_url: formData.file_url || '',
        order: parseInt(formData.order || '0'),
      });
      setIsAddTopicModalOpen(false);
      setSelectedSprint(null);
      setFormData({});
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    
    try {
      setSubmitting(true);
      await api.admin.courses.updateTopic(id as string, selectedTopic.id, {
        title: formData.title,
        type: formData.type,
      });
      setIsEditTopicModalOpen(false);
      setSelectedTopic(null);
      setFormData({});
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    
    try {
      await api.admin.courses.deleteTopic(id as string, topicId);
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    }
  };

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({...formData, file: file});
    }
  };

  // Material Upload
const handleUploadMaterial = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedTopic || !selectedFile) return;

  try {
    setSubmitting(true);
    await api.adminResources.uploadMaterialFile(
      id as string,
      selectedTopic.id,
      selectedFile
    );
    setIsUploadMaterialModalOpen(false);
    setSelectedTopic(null);
    setFormData({});
    setSelectedFile(null);
    fetchCourseDetails();
  } catch (error: any) {
    alert(handleApiError(error));
  } finally {
    setSubmitting(false);
  }
};


  // External Resource Management
  const handleAddExternalResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      await api.adminResources.createExternalResource(id as string, {
        category: formData.category || 'video_tutorials',
        title: formData.title,
        description: formData.description || '',
        url: formData.url,
        source: formData.source,
        duration: formData.duration || '',
      });
      setIsAddResourceModalOpen(false);
      setFormData({});
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExternalResource = async (resourceId: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await api.adminResources.deleteExternalResource(id as string, resourceId);
      fetchCourseDetails();
    } catch (error: any) {
      alert(handleApiError(error));
    }
  };

  // Modals
  const AddSprintModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add New Sprint</h2>
          <button onClick={() => setIsAddSprintModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddSprint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Title</label>
            <input 
              type="text" 
              required
              value={formData.sprint_name || ''}
              onChange={(e) => setFormData({...formData, sprint_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Introduction to Product Management"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Number</label>
            <input 
              type="number" 
              required
              min="1"
              value={formData.sprint_number || ''}
              onChange={(e) => setFormData({...formData, sprint_number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="1"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsAddSprintModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitting ? 'Creating...' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditSprintModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Sprint</h2>
          <button onClick={() => setIsEditSprintModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleEditSprint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Title</label>
            <input 
              type="text" 
              required
              value={formData.sprint_name || ''}
              onChange={(e) => setFormData({...formData, sprint_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Number</label>
            <input 
              type="number" 
              required
              min="1"
              value={formData.sprint_number || ''}
              onChange={(e) => setFormData({...formData, sprint_number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsEditSprintModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddTopicModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Topic</h2>
          <button onClick={() => setIsAddTopicModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddTopic} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Topic Title</label>
            <input 
              type="text" 
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Introduction to User Research"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Type</label>
            <select 
              value={formData.type || 'document'}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="document">Document</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">URL (Optional)</label>
            <input 
              type="url"
              value={formData.file_url || ''}
              onChange={(e) => setFormData({...formData, file_url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsAddTopicModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitting ? 'Adding...' : 'Add Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const EditTopicModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Edit Topic</h2>
          <button onClick={() => setIsEditTopicModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleEditTopic} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Topic Title</label>
            <input 
              type="text" 
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Type</label>
            <select 
              value={formData.type || 'document'}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="document">Document</option>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsEditTopicModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const UploadMaterialModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Material</h2>
          <button 
            onClick={() => {
              setIsUploadMaterialModalOpen(false);
              setSelectedFile(null);
              setFormData({});
            }} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleUploadMaterial} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">
              Select File
            </label>
            
            {/* Hidden file input */}
            <input  type="file" id="file-upload"onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx"/>
            
            {/* Custom file input button */}
            <label 
              htmlFor="file-upload"
              className="w-full block px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors min-h-[100px]"
            >
              <div className="flex flex-col items-center justify-center h-full gap-2">
                {selectedFile ? (
                  <>
                    <Upload size={24} className="text-green-500" />
                    <span className="text-gray-700 font-medium text-center break-all px-2">
                      {selectedFile.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                    <span className="text-xs text-blue-600">Click to change file</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-gray-600">Click to select file</span>
                    <span className="text-xs text-gray-500">PDF, DOC, DOCX, PPT, PPTX</span>
                  </>
                )}
              </div>
            </label>
            
            <p className="text-xs text-gray-500 mt-1">Max file size: 50MB</p>
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={() => {
                setIsUploadMaterialModalOpen(false);
                setSelectedFile(null);
                setFormData({});
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting || !selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              {submitting ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const AddResourceModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-md p-6 m-4 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add External Resource</h2>
          <button onClick={() => setIsAddResourceModalOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleAddExternalResource} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Category</label>
            <select 
              value={formData.category || 'video_tutorials'}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="video_tutorials">Video Tutorials</option>
              <option value="industry_articles">Industry Articles</option>
              <option value="recommended_reading">Recommended Reading</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Title</label>
            <input 
              type="text" 
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Resource title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">URL</label>
            <input 
              type="url" 
              required
              value={formData.url || ''}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Source/Platform</label>
            <input 
              type="text" 
              required
              value={formData.source || ''}
              onChange={(e) => setFormData({...formData, source: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. YouTube, Medium, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Description (Optional)</label>
            <textarea 
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              rows={3}
              placeholder="Brief description..."
            />
          </div>
          
          <div className="flex items-center gap-3 pt-2">
            <button 
              type="button"
              onClick={() => setIsAddResourceModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitting ? 'Adding...' : 'Add Resource'}
            </button>
          </div>
        </form>
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

  if (error || !courseData) {
    return (
      <AdminRouteGuard>
        <AdminLayout>
          <div className="flex flex-col items-center justify-center h-96">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-red-500 mb-4">{error || 'Course not found'}</p>
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
                          onClick={() => {
                            setSelectedSprint(sprint);
                            setFormData({
                              sprint_name: sprint.title,
                              sprint_number: sprint.number,
                            });
                            setIsEditSprintModalOpen(true);
                          }}
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
                            <span className="text-xs text-gray-500">({topic.type})</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setSelectedTopic(topic);
                                setFormData({});
                                setSelectedFile(null);
                                setIsUploadMaterialModalOpen(true);
                              }}
                              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Upload file"
                            >
                              <Upload size={14} />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedTopic(topic);
                                setFormData({
                                  title: topic.title,
                                  type: topic.type,
                                });
                                setIsEditTopicModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setFormData({});
                          setIsAddTopicModalOpen(true);
                        }}
                        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-dashed border-gray-300 hover:border-gray-400 mt-4"
                      >
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
                  <p className="text-sm text-gray-500 mt-1">View and manage all uploaded materials</p>
                </div>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500">
                          No materials uploaded yet
                        </td>
                      </tr>
                    ) : (
                      materials.map((material) => (
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
                        </tr>
                      ))
                    )}
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
                  <p className="text-sm text-gray-500 mt-1">Add external learning resources</p>
                </div>
                <button 
                  onClick={() => {
                    setFormData({});
                    setIsAddResourceModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <Plus size={18} />
                  Add Resource
                </button>
              </div>

              <div className="space-y-4">
                {external_resources.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No external resources added yet
                  </div>
                ) : (
                  external_resources.map((resource) => (
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
                        <button 
                          onClick={() => handleDeleteExternalResource(resource.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.total_enrollments}</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Active Students</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.active_students}</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Avg. Progress</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.avg_progress}%</div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500 font-medium">Payment Rate</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.payment_rate}%</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Sprint Completion Rates</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart_data.sprint_completion}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="sprint" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <RechartsTooltip />
                        <Bar dataKey="completion" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Progress Distribution</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chart_data.progress_distribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        >
                          {chart_data.progress_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <h3 className="text-lg font-semibold text-gray-900">Enrolled Students ({students.length})</h3>
                  <button 
                    onClick={() => setIsMessageModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Send Message
                  </button>
                </div>

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

          {/* Modals */}
          {isEditSprintModalOpen && <EditSprintModal />}
          {isAddSprintModalOpen && <AddSprintModal />}
          {isAddTopicModalOpen && <AddTopicModal />}
          {isEditTopicModalOpen && <EditTopicModal />}
          {isUploadMaterialModalOpen && <UploadMaterialModal />}
          {isAddResourceModalOpen && <AddResourceModal />}
          <ComposeMessageModal 
            isOpen={isMessageModalOpen} 
            onClose={() => setIsMessageModalOpen(false)}
            recipientCount={students.length}
            recipients={students.map(student => ({ 
              id: student.id, 
              name: student.name, 
              email: student.email 
            }))}
            onSend={async (data) => {
              try {
                await api.admin.students.sendMessage(data);
                alert('Message sent successfully!');
                setIsMessageModalOpen(false);
              } catch (error) {
                console.error('Error sending message:', error);
              }
            }}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default CourseDetail;