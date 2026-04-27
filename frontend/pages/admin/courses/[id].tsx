import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/layouts/AdminLayout';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import {
  ArrowLeft, Plus, Edit, Trash, GripVertical, X, Upload,
  Loader2, AlertCircle, Bold, Italic, List, Heading2,
  Heading3, Image as ImageIcon, Video, Type, AlignLeft,
  MoveUp, MoveDown, ListOrdered,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import ComposeMessageModal from '@/components/admin/students/ComposeMessageModal';
import { api, handleApiError } from '@/lib/api';
import type { AdminCourseDetail, AdminCourseSprint, AdminCourseTopic } from '@/lib/types';

// ─── Content Block Types ──────────────────────────────────────────────────────

type BlockType = 'text' | 'image' | 'video';

interface ContentBlock {
  id: string;           // local-only UUID for React key / manipulation
  type: BlockType;
  content: string;      // html for text, url for image/video
}

function generateBlockId() {
  return Math.random().toString(36).slice(2);
}

function serializeBlocks(blocks: ContentBlock[]): string {
  return JSON.stringify(blocks.map(({ type, content }) => ({ type, content })));
}

function parseBlocks(raw: string | null | undefined): ContentBlock[] {
  if (!raw) return [{ id: generateBlockId(), type: 'text', content: '' }];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((b: any) => ({ id: generateBlockId(), type: b.type || 'text', content: b.content || '' }));
    }
  } catch {
    // Legacy plain-text — wrap in a text block
    if (raw.trim()) {
      const html = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .split('\n')
        .map(line => line ? `<p>${line}</p>` : '<p><br></p>')
        .join('');
      return [{ id: generateBlockId(), type: 'text', content: html }];
    }
  }
  return [{ id: generateBlockId(), type: 'text', content: '' }];
}

// ─── Rich Text Editor Block ───────────────────────────────────────────────────

function RichTextBlock({
  block, onChange,
}: {
  block: ContentBlock;
  onChange: (html: string) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external changes (e.g. when block is first created) without clobbering cursor
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== block.content && !isInternalUpdate.current) {
      editorRef.current.innerHTML = block.content;
    }
    isInternalUpdate.current = false;
  }, [block.content]);

  const handleInput = () => {
    isInternalUpdate.current = true;
    onChange(editorRef.current?.innerHTML || '');
  };

  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    handleInput();
  };

  const toolbar: { icon: React.ReactNode; cmd: string; val?: string; title: string }[] = [
    { icon: <Bold size={14} />, cmd: 'bold', title: 'Bold' },
    { icon: <Italic size={14} />, cmd: 'italic', title: 'Italic' },
    { icon: <Heading2 size={14} />, cmd: 'formatBlock', val: 'h2', title: 'Heading 2' },
    { icon: <Heading3 size={14} />, cmd: 'formatBlock', val: 'h3', title: 'Heading 3' },
    { icon: <List size={14} />, cmd: 'insertUnorderedList', title: 'Bullet list' },
    { icon: <ListOrdered size={14} />, cmd: 'insertOrderedList', title: 'Numbered list' },
    { icon: <AlignLeft size={14} />, cmd: 'formatBlock', val: 'p', title: 'Paragraph' },
  ];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        {toolbar.map(({ icon, cmd, val, title }) => (
          <button
            key={title}
            type="button"
            title={title}
            onMouseDown={e => { e.preventDefault(); exec(cmd, val); }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-600 transition"
          >
            {icon}
          </button>
        ))}
      </div>
      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={e => {
          // Strip external styles/fonts but keep structure
          e.preventDefault();
          const html = e.clipboardData.getData('text/html');
          const plain = e.clipboardData.getData('text/plain');
          if (html) {
            // Clean: remove style/class/font attributes
            const clean = html
              .replace(/style="[^"]*"/gi, '')
              .replace(/class="[^"]*"/gi, '')
              .replace(/font-family:[^;"]*/gi, '')
              .replace(/<font[^>]*>/gi, '')
              .replace(/<\/font>/gi, '')
              .replace(/<span\s*>/gi, '<span>')
              .replace(/<span>/gi, '');
            document.execCommand('insertHTML', false, clean);
          } else {
            // Plain text — convert newlines to paragraphs
            const paragraphs = plain.split('\n').map(l => l.trim() ? `<p>${l}</p>` : '<p><br></p>').join('');
            document.execCommand('insertHTML', false, paragraphs);
          }
          handleInput();
        }}
        data-placeholder="Type or paste content here…"
        className={`
          px-4 py-3 min-h-[120px] text-sm text-gray-800 outline-none
          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
          [&_p]:mb-2 [&_p]:leading-relaxed
          [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-2
          [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-2
          [&_li]:mb-0.5
          [&_strong]:font-semibold [&_em]:italic
          empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400
        `}
      />
    </div>
  );
}

// ─── Content Block Editor ─────────────────────────────────────────────────────

function ContentBlockEditor({
  blocks,
  onChange,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}) {
  const update = (id: string, patch: Partial<ContentBlock>) => {
    onChange(blocks.map(b => b.id === id ? { ...b, ...patch } : b));
  };

  const remove = (id: string) => {
    const next = blocks.filter(b => b.id !== id);
    onChange(next.length ? next : [{ id: generateBlockId(), type: 'text', content: '' }]);
  };

  const addBlock = (type: BlockType) => {
    onChange([...blocks, { id: generateBlockId(), type, content: '' }]);
  };

  const move = (index: number, direction: 'up' | 'down') => {
    const next = [...blocks];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={block.id} className="relative group">
          {/* Block controls */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide flex items-center gap-1">
              {block.type === 'text' && <><Type size={11} /> Text</>}
              {block.type === 'image' && <><ImageIcon size={11} /> Image</>}
              {block.type === 'video' && <><Video size={11} /> Video</>}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => move(index, 'up')} disabled={index === 0}
                className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition">
                <MoveUp size={12} />
              </button>
              <button type="button" onClick={() => move(index, 'down')} disabled={index === blocks.length - 1}
                className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition">
                <MoveDown size={12} />
              </button>
              <button type="button" onClick={() => remove(block.id)}
                className="p-1 text-red-300 hover:text-red-600 transition">
                <Trash size={12} />
              </button>
            </div>
          </div>

          {/* Block content */}
          {block.type === 'text' && (
            <RichTextBlock
              block={block}
              onChange={html => update(block.id, { content: html })}
            />
          )}

          {block.type === 'image' && (
            <div className="space-y-2">
              <input
                type="url"
                value={block.content}
                onChange={e => update(block.id, { content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://example.com/image.png"
              />
              {block.content && (
                <img
                  src={block.content}
                  alt="Preview"
                  className="max-h-48 rounded-lg border border-gray-100 object-contain"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
          )}

          {block.type === 'video' && (
            <div className="space-y-2">
              <input
                type="url"
                value={block.content}
                onChange={e => update(block.id, { content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                placeholder="https://drive.google.com/file/d/… or YouTube URL"
              />
              {block.content && (
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Video size={11} /> Video URL saved — will be embedded in preview
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add block buttons */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-xs text-gray-400">Add block:</span>
        <button type="button" onClick={() => addBlock('text')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
          <Type size={12} /> Text
        </button>
        <button type="button" onClick={() => addBlock('image')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition">
          <ImageIcon size={12} /> Image
        </button>
        <button type="button" onClick={() => addBlock('video')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-violet-50 text-violet-700 rounded-lg hover:bg-violet-100 transition">
          <Video size={12} /> Video
        </button>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

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

  // Content blocks for topic editor
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([
    { id: generateBlockId(), type: 'text', content: '' },
  ]);

  useEffect(() => {
    if (id) fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.admin.courses.getById(id as string);
      setCourseData(data);
    } catch (error) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // ── Sprint CRUD ──────────────────────────────────────────────────────────────

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
    } catch (error: any) { alert(handleApiError(error)); }
    finally { setSubmitting(false); }
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
    } catch (error: any) { alert(handleApiError(error)); }
    finally { setSubmitting(false); }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    if (!confirm('Delete this sprint and all its topics?')) return;
    try {
      await api.admin.courses.deleteSprint(id as string, sprintId);
      fetchCourseDetails();
    } catch (error: any) { alert(handleApiError(error)); }
  };

  // ── Topic CRUD ───────────────────────────────────────────────────────────────

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint) return;
    try {
      setSubmitting(true);
      await api.admin.courses.createTopic(id as string, selectedSprint.id, {
        title: formData.title,
        type: 'text',                               // always 'text' — content embedded in text_content
        order: parseInt(formData.order || '0'),
        text_content: serializeBlocks(contentBlocks),
      });
      setIsAddTopicModalOpen(false);
      setSelectedSprint(null);
      setFormData({});
      setContentBlocks([{ id: generateBlockId(), type: 'text', content: '' }]);
      fetchCourseDetails();
    } catch (error: any) { alert(handleApiError(error)); }
    finally { setSubmitting(false); }
  };

  const handleEditTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic) return;
    try {
      setSubmitting(true);
      await api.admin.courses.updateTopic(id as string, selectedTopic.id, {
        title: formData.title,
        text_content: serializeBlocks(contentBlocks),
      });
      setIsEditTopicModalOpen(false);
      setSelectedTopic(null);
      setFormData({});
      setContentBlocks([{ id: generateBlockId(), type: 'text', content: '' }]);
      fetchCourseDetails();
    } catch (error: any) { alert(handleApiError(error)); }
    finally { setSubmitting(false); }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await api.admin.courses.deleteTopic(id as string, topicId);
      fetchCourseDetails();
    } catch (error: any) { alert(handleApiError(error)); }
  };

  // ── File Upload ──────────────────────────────────────────────────────────────

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setFormData({ ...formData, file }); }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !selectedFile) return;
    try {
      setSubmitting(true);
      await api.adminResources.uploadMaterialFile(id as string, selectedTopic.id, selectedFile);
      setIsUploadMaterialModalOpen(false);
      setSelectedTopic(null);
      setFormData({});
      setSelectedFile(null);
      fetchCourseDetails();
    } catch (error: any) { alert(handleApiError(error)); }
    finally { setSubmitting(false); }
  };

  // ── External Resource CRUD ───────────────────────────────────────────────────

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
    } catch (error: any) { alert(handleApiError(error)); }
    finally { setSubmitting(false); }
  };

  const handleDeleteExternalResource = async (resourceId: number) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await api.adminResources.deleteExternalResource(id as string, resourceId);
      fetchCourseDetails();
    } catch (error: any) { alert(handleApiError(error)); }
  };

  // ── Loading / Error ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <AdminRouteGuard><AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </AdminLayout></AdminRouteGuard>
    );
  }

  if (error || !courseData) {
    return (
      <AdminRouteGuard><AdminLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p className="text-red-500 mb-4">{error || 'Course not found'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-900 text-white rounded-lg">Go Back</button>
        </div>
      </AdminLayout></AdminRouteGuard>
    );
  }

  const { course, sprints, materials, external_resources, statistics, students, chart_data } = courseData;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="min-h-screen bg-gray-50/50 p-6">

          {/* Header */}
          <div className="mb-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
              <ArrowLeft size={16} /> Back
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
                <Plus size={18} /> Add Sprint
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
            {['Sprints', 'Course Materials', 'External Resources', 'Course Details'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />}
              </button>
            ))}
          </div>

          {/* ─── SPRINTS TAB ───────────────────────────────────────────────────── */}
          {activeTab === 'Sprints' && (
            <div className="space-y-6">
              {sprints.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No sprints yet. Click "Add Sprint" to create one.</div>
              ) : (
                sprints.map(sprint => (
                  <div key={sprint.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-4 flex items-center justify-between bg-white border-b border-gray-100">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-50 rounded-lg cursor-move"><GripVertical size={16} className="text-gray-400" /></div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">Sprint {sprint.number}</span>
                            <span className="text-xs text-gray-500">Week {sprint.week}</span>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900">{sprint.title}</h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedSprint(sprint); setFormData({ sprint_name: sprint.title, sprint_number: sprint.number }); setIsEditSprintModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"
                        ><Edit size={16} /></button>
                        <button onClick={() => handleDeleteSprint(sprint.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash size={16} /></button>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/50 space-y-2">
                      {sprint.topics.map(topic => (
                        <div key={topic.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-gray-50 rounded text-gray-400"><GripVertical size={14} /></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                            <span className="text-sm text-gray-700">{topic.title}</span>
                            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">rich content</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setSelectedTopic(topic);
                                setFormData({ title: topic.title });
                                setContentBlocks(parseBlocks(topic.text_content));
                                setIsEditTopicModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
                            ><Edit size={14} /></button>
                            <button onClick={() => handleDeleteTopic(topic.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash size={14} /></button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => { setSelectedSprint(sprint); setFormData({}); setContentBlocks([{ id: generateBlockId(), type: 'text', content: '' }]); setIsAddTopicModalOpen(true); }}
                        className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-dashed border-gray-300 hover:border-gray-400 mt-4"
                      >
                        <Plus size={16} /> Add Topic
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── COURSE MATERIALS TAB ──────────────────────────────────────────── */}
          {activeTab === 'Course Materials' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Course Materials Management</h2>
                <p className="text-sm text-gray-500 mt-1">View and manage all uploaded materials</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Material Name', 'Type', 'Sprint', 'Size', 'Access', 'Upload Date'].map(h => (
                        <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.length === 0 ? (
                      <tr><td colSpan={6} className="py-8 text-center text-gray-500">No materials uploaded yet</td></tr>
                    ) : materials.map(material => (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{material.name}</td>
                        <td className="py-3 px-4"><span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium text-gray-600">{material.type}</span></td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.sprint}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.size}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.access}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{material.upload_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── EXTERNAL RESOURCES TAB ───────────────────────────────────────── */}
          {activeTab === 'External Resources' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">External Resources Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Add external learning resources</p>
                </div>
                <button onClick={() => { setFormData({}); setIsAddResourceModalOpen(true); }} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                  <Plus size={18} /> Add Resource
                </button>
              </div>
              <div className="space-y-4">
                {external_resources.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No external resources added yet</div>
                ) : external_resources.map(resource => (
                  <div key={resource.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">{resource.type === 'video' ? '🎥' : '📄'}</div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">{resource.title}</h3>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">🔗 {resource.url}</a>
                        <p className="text-xs text-gray-500 mt-1">Added: {resource.date}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteExternalResource(resource.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded self-end md:self-start"><Trash size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── COURSE DETAILS TAB ───────────────────────────────────────────── */}
          {activeTab === 'Course Details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Enrollments', value: statistics.total_enrollments },
                  { label: 'Active Students', value: statistics.active_students },
                  { label: 'Avg. Progress', value: `${statistics.avg_progress}%` },
                  { label: 'Payment Rate', value: `${statistics.payment_rate}%` },
                ].map(stat => (
                  <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-sm text-gray-500 font-medium mb-4">{stat.label}</div>
                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>

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
                        <Pie data={chart_data.progress_distribution} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {chart_data.progress_distribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Enrolled Students ({students.length})</h3>
                  <button onClick={() => setIsMessageModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-gray-800">Send Message</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Student Name', 'Email', 'Payment Status', 'Activity Status', 'Progress', 'Enrolled Date'].map(h => (
                          <th key={h} className="py-3 px-4 text-xs font-medium text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map(student => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{student.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{student.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${student.payment === 'Completed' ? 'bg-green-100 text-green-700' : student.payment === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{student.payment}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${student.activity === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{student.activity}</span>
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

          {/* ══════════════════════════════════════════════════════════════════════
               MODALS
          ══════════════════════════════════════════════════════════════════════ */}

          {/* Add Sprint */}
          {isAddSprintModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add New Sprint</h2>
                  <button onClick={() => setIsAddSprintModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddSprint} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Title</label>
                    <input type="text" required value={formData.sprint_name || ''} onChange={e => setFormData({ ...formData, sprint_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Introduction to Product Management" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Number</label>
                    <input type="number" required min="1" value={formData.sprint_number || ''} onChange={e => setFormData({ ...formData, sprint_number: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="1" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddSprintModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {submitting ? 'Creating…' : 'Create Sprint'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Sprint */}
          {isEditSprintModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Sprint</h2>
                  <button onClick={() => setIsEditSprintModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleEditSprint} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Title</label>
                    <input type="text" required value={formData.sprint_name || ''} onChange={e => setFormData({ ...formData, sprint_name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Sprint Number</label>
                    <input type="number" required min="1" value={formData.sprint_number || ''} onChange={e => setFormData({ ...formData, sprint_number: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => setIsEditSprintModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                      {submitting ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Add Topic Modal (wide, scrollable) ─────────────────────────────── */}
          {isAddTopicModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                  <h2 className="text-xl font-semibold text-gray-900">Add Topic</h2>
                  <button onClick={() => setIsAddTopicModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddTopic} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">Topic Title</label>
                      <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Introduction to User Research" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Content Blocks</label>
                      <p className="text-xs text-gray-500 mb-3">Build your topic by adding text, images, and videos in any order.</p>
                      <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button type="button" onClick={() => setIsAddTopicModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {submitting ? 'Adding…' : 'Add Topic'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ── Edit Topic Modal ────────────────────────────────────────────────── */}
          {isEditTopicModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '92vh' }}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                  <h2 className="text-xl font-semibold text-gray-900">Edit Topic</h2>
                  <button onClick={() => setIsEditTopicModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleEditTopic} className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">Topic Title</label>
                      <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Content Blocks</label>
                      <p className="text-xs text-gray-500 mb-3">Rearrange, edit, or add new blocks below.</p>
                      <ContentBlockEditor blocks={contentBlocks} onChange={setContentBlocks} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button type="button" onClick={() => setIsEditTopicModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                      {submitting ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Upload Material */}
          {isUploadMaterialModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl w-full max-w-md p-6 m-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Upload Material</h2>
                  <button onClick={() => { setIsUploadMaterialModalOpen(false); setSelectedFile(null); setFormData({}); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleUploadMaterial} className="space-y-4">
                  <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx" />
                  <label htmlFor="file-upload" className="w-full block px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 min-h-[100px]">
                    <div className="flex flex-col items-center justify-center gap-2 pt-4">
                      {selectedFile ? (
                        <><Upload size={24} className="text-green-500" /><span className="text-gray-700 font-medium text-center break-all px-2">{selectedFile.name}</span><span className="text-xs text-blue-600">Click to change</span></>
                      ) : (
                        <><Upload size={24} className="text-gray-400" /><span className="text-gray-600">Click to select file</span><span className="text-xs text-gray-500">PDF, DOC, DOCX, PPT, PPTX</span></>
                      )}
                    </div>
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => { setIsUploadMaterialModalOpen(false); setSelectedFile(null); setFormData({}); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={submitting || !selectedFile} className="px-4 py-2 text-sm font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      {submitting ? 'Uploading…' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add External Resource */}
          {isAddResourceModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
              <div className="bg-white rounded-xl w-full max-w-md p-6 m-4 my-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Add External Resource</h2>
                  <button onClick={() => setIsAddResourceModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                </div>
                <form onSubmit={handleAddExternalResource} className="space-y-4">
                  {[
                    { label: 'Category', name: 'category', type: 'select', options: [['video_tutorials', 'Video Tutorials'], ['industry_articles', 'Industry Articles'], ['recommended_reading', 'Recommended Reading']] },
                    { label: 'Title', name: 'title', type: 'text', required: true, placeholder: 'Resource title' },
                    { label: 'URL', name: 'url', type: 'url', required: true, placeholder: 'https://...' },
                    { label: 'Source/Platform', name: 'source', type: 'text', required: true, placeholder: 'e.g. YouTube, Medium…' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-900 mb-1.5">{field.label}</label>
                      {field.type === 'select' ? (
                        <select value={formData[field.name] || field.options![0][0]} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                          {field.options!.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                        </select>
                      ) : (
                        <input type={field.type} required={field.required} value={formData[field.name] || ''} onChange={e => setFormData({ ...formData, [field.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder={field.placeholder} />
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">Description (Optional)</label>
                    <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" rows={3} placeholder="Brief description…" />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={() => setIsAddResourceModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={submitting} className="px-4 py-2 text-sm  font-medium text-white bg-[#0F172A] rounded-lg hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                      {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {submitting ? 'Adding…' : 'Add Resource'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <ComposeMessageModal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            recipientCount={students.length}
            recipients={students.map(s => ({ id: s.id, name: s.name, email: s.email }))}
            onSend={async data => {
              try { await api.admin.students.sendMessage(data); alert('Message sent successfully!'); setIsMessageModalOpen(false); }
              catch (error) { console.error('Error sending message:', error); }
            }}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
};

export default CourseDetail;