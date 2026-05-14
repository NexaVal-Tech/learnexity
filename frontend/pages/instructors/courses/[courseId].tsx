// pages/instructor/courses/[courseId].tsx

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/layouts/InstructorLayout';
import InstructorRouteGuard from '@/components/instructor/InstructorRouteGuard';
import { instructorApi, InstructorProject, ProjectSubmission } from '@/lib/instructorApi';
import { handleInstructorApiError } from '@/lib/instructorApi';
import {
  ArrowLeft, Plus, Edit, Trash, GripVertical, X, Upload,
  Loader2, Users, FolderKanban, ChevronRight, Check, Clock,
  FileText, File as FileIcon, Type, CheckCircle, AlertCircle,
} from 'lucide-react';

// ── Phase badge helper ────────────────────────────────────────────────────────

const PHASES = ['brief', 'team', 'execution', 'review', 'delivery'] as const;
type Phase = typeof PHASES[number];

const phaseMeta: Record<Phase, { label: string; color: string; bg: string }> = {
  brief:     { label: 'Brief',     color: 'text-blue-700',   bg: 'bg-blue-50' },
  team:      { label: 'Team',      color: 'text-violet-700', bg: 'bg-violet-50' },
  execution: { label: 'Execution', color: 'text-amber-700',  bg: 'bg-amber-50' },
  review:    { label: 'Review',    color: 'text-orange-700', bg: 'bg-orange-50' },
  delivery:  { label: 'Delivery',  color: 'text-green-700',  bg: 'bg-green-50' },
};

// ── Main component ────────────────────────────────────────────────────────────

export default function InstructorCourseDetail() {
  const router = useRouter();
  const { courseId } = router.query as { courseId: string };

  const [activeTab, setActiveTab] = useState<'sprints' | 'students' | 'projects'>('sprints');
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Sprint / Topic modals
  const [addSprintOpen, setAddSprintOpen]   = useState(false);
  const [editSprintOpen, setEditSprintOpen] = useState(false);
  const [addTopicOpen, setAddTopicOpen]     = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  const [selectedTopic, setSelectedTopic]   = useState<any>(null);
  const [sprintForm, setSprintForm]         = useState({ sprint_name: '', sprint_number: '' });
  const [topicForm, setTopicForm]           = useState({ title: '', type: 'text' as string });
  const [topicFile, setTopicFile]           = useState<File | null>(null);

  // Project modals
  const [addProjectOpen, setAddProjectOpen]         = useState(false);
  const [projectForm, setProjectForm]               = useState({ title: '', brief: '', expected_outcome: '', deadline: '' });
  const [selectedProject, setSelectedProject]       = useState<InstructorProject | null>(null);
  const [submissions, setSubmissions]               = useState<ProjectSubmission[]>([]);
  const [reviewOpen, setReviewOpen]                 = useState(false);
  const [reviewTarget, setReviewTarget]             = useState<ProjectSubmission | null>(null);
  const [reviewForm, setReviewForm]                 = useState({ status: 'reviewed' as string, instructor_feedback: '' });

  const fetchData = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const data = await instructorApi.courses.getById(courseId);
      setCourseData(data);
    } catch (e) {
      setError(handleInstructorApiError(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [courseId]);

  // ── Sprint handlers ───────────────────────────────────────────────────────

  const handleAddSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await instructorApi.courses.createSprint(courseId, {
        sprint_name:   sprintForm.sprint_name,
        sprint_number: parseInt(sprintForm.sprint_number),
      });
      setAddSprintOpen(false);
      setSprintForm({ sprint_name: '', sprint_number: '' });
      fetchData();
    } catch (e) { alert(handleInstructorApiError(e)); }
    finally { setSubmitting(false); }
  };

  const handleEditSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint) return;
    try {
      setSubmitting(true);
      await instructorApi.courses.updateSprint(courseId, selectedSprint.id, {
        sprint_name:   sprintForm.sprint_name,
        sprint_number: parseInt(sprintForm.sprint_number),
      });
      setEditSprintOpen(false);
      fetchData();
    } catch (e) { alert(handleInstructorApiError(e)); }
    finally { setSubmitting(false); }
  };

  const handleDeleteSprint = async (sprintId: number) => {
    if (!confirm('Delete this sprint and all its topics?')) return;
    try {
      await instructorApi.courses.deleteSprint(courseId, sprintId);
      fetchData();
    } catch (e) { alert(handleInstructorApiError(e)); }
  };

  // ── Topic handlers ────────────────────────────────────────────────────────

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSprint) return;
    try {
      setSubmitting(true);
      let fileType = topicForm.type;
      if (topicFile) {
        const ext = topicFile.name.split('.').pop()?.toLowerCase();
        fileType = ext === 'pdf' ? 'pdf' : 'document';
      }
      const result: any = await instructorApi.courses.createTopic(courseId, selectedSprint.id, {
        title: topicForm.title,
        type:  fileType,
      });
      if (topicFile) {
        const itemId = result?.item?.id ?? result?.id;
        if (itemId) await instructorApi.courses.uploadTopicFile(courseId, itemId, topicFile);
      }
      setAddTopicOpen(false);
      setTopicForm({ title: '', type: 'text' });
      setTopicFile(null);
      fetchData();
    } catch (e) { alert(handleInstructorApiError(e)); }
    finally { setSubmitting(false); }
  };

  const handleDeleteTopic = async (topicId: number) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await instructorApi.courses.deleteTopic(courseId, topicId);
      fetchData();
    } catch (e) { alert(handleInstructorApiError(e)); }
  };

  // ── Project handlers ──────────────────────────────────────────────────────

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await instructorApi.projects.create(courseId, projectForm);
      setAddProjectOpen(false);
      setProjectForm({ title: '', brief: '', expected_outcome: '', deadline: '' });
      fetchData();
    } catch (e) { alert(handleInstructorApiError(e)); }
    finally { setSubmitting(false); }
  };

  const handleAdvancePhase = async (projectId: number) => {
    if (!confirm('Advance this project to the next phase?')) return;
    try {
      await instructorApi.projects.advancePhase(projectId);
      fetchData();
    } catch (e) { alert(handleInstructorApiError(e)); }
  };

  const openReview = async (project: InstructorProject) => {
    setSelectedProject(project);
    const subs = await instructorApi.projects.getSubmissions(project.id);
    setSubmissions(subs);
  };

  const handleReviewSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget) return;
    try {
      setSubmitting(true);
      await instructorApi.projects.reviewSubmission(reviewTarget.id, {
        status:               reviewForm.status as any,
        instructor_feedback:  reviewForm.instructor_feedback,
      });
      setReviewOpen(false);
      setReviewTarget(null);
      setReviewForm({ status: 'reviewed', instructor_feedback: '' });
      if (selectedProject) {
        const subs = await instructorApi.projects.getSubmissions(selectedProject.id);
        setSubmissions(subs);
      }
    } catch (e) { alert(handleInstructorApiError(e)); }
    finally { setSubmitting(false); }
  };

  // ── Loading / error ───────────────────────────────────────────────────────

  if (loading) return (
    <InstructorRouteGuard>
      <InstructorLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      </InstructorLayout>
    </InstructorRouteGuard>
  );

  if (error || !courseData) return (
    <InstructorRouteGuard>
      <InstructorLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Go Back</button>
        </div>
      </InstructorLayout>
    </InstructorRouteGuard>
  );

  const { course, sprints, students, projects } = courseData;

  return (
    <InstructorRouteGuard>
      <InstructorLayout>
        <div className="space-y-6">

          {/* Header */}
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4">
              <ArrowLeft size={16} /> Back to Courses
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-500 mt-1">{sprints?.length ?? 0} sprints · {students?.length ?? 0} enrolled students</p>
              </div>
              {activeTab === 'sprints' && (
                <button onClick={() => setAddSprintOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Plus size={16} /> Add Sprint
                </button>
              )}
              {activeTab === 'projects' && (
                <button onClick={() => setAddProjectOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                  <Plus size={16} /> New Project
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200">
            {[
              { key: 'sprints',  label: 'Sprints & Materials' },
              { key: 'students', label: `Students (${students?.length ?? 0})` },
              { key: 'projects', label: 'Projects' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key as any); setSelectedProject(null); }}
                className={`px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.key ? 'text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── SPRINTS TAB ──────────────────────────────────────────────────── */}
          {activeTab === 'sprints' && (
            <div className="space-y-4">
              {!sprints || sprints.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No sprints yet. Click "Add Sprint" to create one.</p>
                </div>
              ) : sprints.map((sprint: any) => (
                <div key={sprint.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                        Sprint {sprint.number}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{sprint.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSprint(sprint);
                          setSprintForm({ sprint_name: sprint.title, sprint_number: String(sprint.number) });
                          setEditSprintOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-white rounded-lg"
                      >
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDeleteSprint(sprint.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    {[...(sprint.topics || [])].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)).map((topic: any) => (
                      <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`text-xs font-bold px-2 py-0.5 rounded ${
                            topic.type === 'pdf'      ? 'bg-red-100 text-red-600' :
                            topic.type === 'document' ? 'bg-orange-100 text-orange-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {topic.type.toUpperCase().slice(0, 3)}
                          </div>
                          <span className="text-sm text-gray-700">{topic.title}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteTopic(topic.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => { setSelectedSprint(sprint); setAddTopicOpen(true); }}
                      className="w-full py-2 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <Plus size={15} /> Add Topic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STUDENTS TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Enrolled Students</h2>
              </div>
              {!students || students.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No enrolled students yet.</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {students.map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${student.progress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-10 text-right">{student.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PROJECTS TAB ─────────────────────────────────────────────────── */}
          {activeTab === 'projects' && !selectedProject && (
            <div className="space-y-4">
              {!projects || projects.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <FolderKanban size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No projects yet. Create one to get started.</p>
                </div>
              ) : projects.map((project: InstructorProject) => {
                const meta = phaseMeta[project.phase];
                return (
                  <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{project.title}</h3>
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                            {meta.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{project.brief}</p>
                        {project.deadline && (
                          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            <Clock size={11} /> Deadline: {new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => openReview(project).then(() => setSelectedProject(project))}
                          className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition"
                        >
                          View Submissions
                        </button>
                        {project.phase !== 'delivery' && (
                          <button
                            onClick={() => handleAdvancePhase(project.id)}
                            className="text-sm px-3 py-1.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-700 transition flex items-center gap-1"
                          >
                            Advance <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Phase progress bar */}
                    <div className="mt-4 flex items-center gap-1">
                      {PHASES.map((ph, i) => {
                        const phaseIndex = PHASES.indexOf(project.phase);
                        const isDone     = i < phaseIndex;
                        const isCurrent  = i === phaseIndex;
                        return (
                          <div key={ph} className="flex-1">
                            <div className={`h-1.5 rounded-full ${isDone ? 'bg-indigo-600' : isCurrent ? 'bg-indigo-300' : 'bg-gray-200'}`} />
                            <p className="text-[10px] text-gray-400 mt-1 text-center capitalize hidden md:block">{ph}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PROJECT SUBMISSIONS VIEW ──────────────────────────────────────── */}
          {activeTab === 'projects' && selectedProject && (
            <div className="space-y-4">
              <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft size={15} /> Back to Projects
              </button>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-1">{selectedProject.title} — Submissions</h2>
                <p className="text-sm text-gray-500 mb-5">Phase: {phaseMeta[selectedProject.phase].label}</p>

                {submissions.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No submissions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((sub) => (
                      <div key={sub.id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{sub.user?.name}</p>
                            <p className="text-xs text-gray-500">{sub.user?.email}</p>
                            {sub.content && <p className="text-sm text-gray-700 mt-2 line-clamp-3">{sub.content}</p>}
                            {sub.file_name && (
                              <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1">
                                <FileText size={11} /> {sub.file_name}
                              </p>
                            )}
                            {sub.instructor_feedback && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                                <span className="font-semibold text-gray-800">Feedback: </span>
                                {sub.instructor_feedback}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              sub.status === 'approved'           ? 'bg-green-100 text-green-700' :
                              sub.status === 'revision_requested' ? 'bg-orange-100 text-orange-700' :
                              sub.status === 'reviewed'           ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {sub.status.replace('_', ' ')}
                            </span>
                            <button
                              onClick={() => { setReviewTarget(sub); setReviewOpen(true); }}
                              className="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

        {/* Add Sprint */}
        {addSprintOpen && (
          <Modal title="Add Sprint" onClose={() => setAddSprintOpen(false)}>
            <form onSubmit={handleAddSprint} className="space-y-4">
              <Field label="Sprint Title">
                <input required value={sprintForm.sprint_name} onChange={(e) => setSprintForm({ ...sprintForm, sprint_name: e.target.value })} className={inputCls} placeholder="e.g. Introduction to Design" />
              </Field>
              <Field label="Sprint Number">
                <input required type="number" min="1" value={sprintForm.sprint_number} onChange={(e) => setSprintForm({ ...sprintForm, sprint_number: e.target.value })} className={inputCls} placeholder="1" />
              </Field>
              <ModalActions onCancel={() => setAddSprintOpen(false)} submitting={submitting} submitLabel="Create Sprint" />
            </form>
          </Modal>
        )}

        {/* Edit Sprint */}
        {editSprintOpen && (
          <Modal title="Edit Sprint" onClose={() => setEditSprintOpen(false)}>
            <form onSubmit={handleEditSprint} className="space-y-4">
              <Field label="Sprint Title">
                <input required value={sprintForm.sprint_name} onChange={(e) => setSprintForm({ ...sprintForm, sprint_name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Sprint Number">
                <input required type="number" min="1" value={sprintForm.sprint_number} onChange={(e) => setSprintForm({ ...sprintForm, sprint_number: e.target.value })} className={inputCls} />
              </Field>
              <ModalActions onCancel={() => setEditSprintOpen(false)} submitting={submitting} submitLabel="Save Changes" />
            </form>
          </Modal>
        )}

        {/* Add Topic */}
        {addTopicOpen && (
          <Modal title="Add Topic" onClose={() => { setAddTopicOpen(false); setTopicFile(null); }}>
            <form onSubmit={handleAddTopic} className="space-y-4">
              <Field label="Topic Title">
                <input required value={topicForm.title} onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })} className={inputCls} placeholder="e.g. Week 1 Reading" />
              </Field>
              <Field label="Content Type">
                <select value={topicForm.type} onChange={(e) => setTopicForm({ ...topicForm, type: e.target.value })} className={inputCls}>
                  <option value="text">Rich Text / Notes</option>
                  <option value="pdf">PDF Upload</option>
                  <option value="document">Document Upload</option>
                  <option value="video">Video URL</option>
                </select>
              </Field>
              {(topicForm.type === 'pdf' || topicForm.type === 'document') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload File</label>
                  <label className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{topicFile ? topicFile.name : 'Click to select file'}</span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setTopicFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              )}
              <ModalActions onCancel={() => { setAddTopicOpen(false); setTopicFile(null); }} submitting={submitting} submitLabel="Add Topic" />
            </form>
          </Modal>
        )}

        {/* Add Project */}
        {addProjectOpen && (
          <Modal title="Create Project" onClose={() => setAddProjectOpen(false)}>
            <form onSubmit={handleAddProject} className="space-y-4">
              <Field label="Project Title">
                <input required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} className={inputCls} placeholder="e.g. Brand Identity Design Sprint" />
              </Field>
              <Field label="Project Brief">
                <textarea required rows={4} value={projectForm.brief} onChange={(e) => setProjectForm({ ...projectForm, brief: e.target.value })} className={inputCls} placeholder="Describe the project task clearly..." />
              </Field>
              <Field label="Expected Outcome (optional)">
                <textarea rows={2} value={projectForm.expected_outcome} onChange={(e) => setProjectForm({ ...projectForm, expected_outcome: e.target.value })} className={inputCls} placeholder="What should students produce?" />
              </Field>
              <Field label="Deadline (optional)">
                <input type="date" value={projectForm.deadline} onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })} className={inputCls} />
              </Field>
              <ModalActions onCancel={() => setAddProjectOpen(false)} submitting={submitting} submitLabel="Create Project" />
            </form>
          </Modal>
        )}

        {/* Review Submission */}
        {reviewOpen && reviewTarget && (
          <Modal title="Review Submission" onClose={() => setReviewOpen(false)}>
            <form onSubmit={handleReviewSubmission} className="space-y-4">
              <Field label="Decision">
                <select value={reviewForm.status} onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })} className={inputCls}>
                  <option value="reviewed">Reviewed</option>
                  <option value="revision_requested">Request Revision</option>
                  <option value="approved">Approve</option>
                </select>
              </Field>
              <Field label="Feedback">
                <textarea required rows={4} value={reviewForm.instructor_feedback} onChange={(e) => setReviewForm({ ...reviewForm, instructor_feedback: e.target.value })} className={inputCls} placeholder="Write your feedback here…" />
              </Field>
              <ModalActions onCancel={() => setReviewOpen(false)} submitting={submitting} submitLabel="Submit Review" />
            </form>
          </Modal>
        )}

      </InstructorLayout>
    </InstructorRouteGuard>
  );
}

// ── Shared modal sub-components ───────────────────────────────────────────────

const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, submitting, submitLabel }: { onCancel: () => void; submitting: boolean; submitLabel: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
      <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
        {submitting && <Loader2 size={15} className="animate-spin" />}
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </div>
  );
}