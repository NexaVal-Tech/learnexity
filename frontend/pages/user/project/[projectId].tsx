// pages/user/projects/[projectId].tsx

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { api } from '@/lib/api';
import {
  ArrowLeft, Upload, Send, CheckCircle, Clock, AlertCircle,
  Loader2, FileText, MessageSquare, Users, Calendar,
  ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';

const PHASES = ['brief', 'team', 'execution', 'review', 'delivery'];
const PHASE_META: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  brief:     { label: 'Project Brief',   color: 'text-blue-700',   bg: 'bg-blue-50',   desc: 'Read the project brief and understand the task.' },
  team:      { label: 'Team Assignment', color: 'text-violet-700', bg: 'bg-violet-50', desc: 'Your role has been assigned. Review your responsibilities.' },
  execution: { label: 'Execution',       color: 'text-amber-700',  bg: 'bg-amber-50',  desc: 'Work on the project. Submit daily check-ins and your deliverable.' },
  review:    { label: 'Review',          color: 'text-orange-700', bg: 'bg-orange-50', desc: 'Your instructor is reviewing your submission. Await feedback.' },
  delivery:  { label: 'Delivery',        color: 'text-green-700',  bg: 'bg-green-50',  desc: 'Project delivered. Review final feedback from your instructor.' },
};

export default function StudentProjectDetail() {
  const router = useRouter();
  const { projectId } = router.query as { projectId: string };

  const [data, setData]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [activeTab, setActiveTab]     = useState<'overview' | 'submit' | 'checkin' | 'history'>('overview');

  // Submission form
  const [submitText, setSubmitText]   = useState('');
  const [submitFile, setSubmitFile]   = useState<File | null>(null);
  const [submitting, setSubmitting]   = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError]   = useState('');

  // Check-in form
  const [checkinText, setCheckinText] = useState('');
  const [checkinBlocker, setCheckinBlocker] = useState('');
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState('');
  const [checkinError, setCheckinError]     = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = () => {
    if (!projectId) return;
    api.get(`/api/student/projects/${projectId}/detail`)
      .then(setData)
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!submitText.trim() && !submitFile) {
      setSubmitError('Please provide a text submission or upload a file.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      if (submitText.trim()) formData.append('content', submitText);
      if (submitFile)        formData.append('file', submitFile);
      formData.append('phase', data.project.phase);

      await api.post(`/api/student/projects/${projectId}/submit`, formData);
      setSubmitSuccess('Submission received! Your instructor will review it shortly.');
      setSubmitText('');
      setSubmitFile(null);
      fetchData();
      setTimeout(() => setActiveTab('history'), 1500);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckinError('');
    setCheckinSuccess('');
    try {
      setCheckinSubmitting(true);
      await api.post(`/api/student/projects/${projectId}/checkin`, {
        update:  checkinText,
        blocker: checkinBlocker,
      });
      setCheckinSuccess("Today's check-in submitted!");
      setCheckinText('');
      setCheckinBlocker('');
      fetchData();
    } catch (err: any) {
      setCheckinError(err?.response?.data?.message ?? 'Check-in failed.');
    } finally {
      setCheckinSubmitting(false);
    }
  };

  if (loading) return (
    <UserDashboardLayout>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    </UserDashboardLayout>
  );

  if (error || !data) return (
    <UserDashboardLayout>
      <div className="max-w-xl mx-auto pt-32 text-center px-4">
        <AlertCircle size={40} className="mx-auto text-red-400 mb-3" />
        <p className="text-red-600 mb-4">{error || 'Project not found.'}</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm">Go Back</button>
      </div>
    </UserDashboardLayout>
  );

  const { project, my_submissions, my_team_role, team_roles, my_checkins, checkin_today } = data;
  const meta       = PHASE_META[project.phase] ?? PHASE_META.brief;
  const phaseIndex = PHASES.indexOf(project.phase);

  return (
    <UserDashboardLayout>
      <div className="max-w-[900px] mx-auto px-4 py-8 pt-25">

        {/* Back */}
        <button onClick={() => router.push('/user/projects')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft size={15} /> Back to Projects
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{meta.desc}</p>
            </div>
            {my_team_role && (
              <span className="text-sm bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-full flex-shrink-0">
                Your Role: {my_team_role.role}
              </span>
            )}
          </div>

          {/* Phase tracker */}
          <div className="flex items-center gap-2">
            {PHASES.map((ph, i) => {
              const isDone    = i < phaseIndex;
              const isCurrent = i === phaseIndex;
              const phMeta    = PHASE_META[ph];
              return (
                <div key={ph} className="flex-1 text-center">
                  <div className={`h-2 rounded-full mb-1.5 ${
                    isDone    ? 'bg-indigo-600' :
                    isCurrent ? 'bg-indigo-300' :
                    'bg-gray-200'
                  }`} />
                  <p className={`text-[10px] font-medium hidden sm:block ${isCurrent ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {phMeta.label.split(' ')[0]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'Brief' },
            { key: 'submit',   label: 'Submit Work' },
            { key: 'checkin',  label: `Daily Check-in${checkin_today ? ' ✓' : ''}` },
            { key: 'history',  label: `Submissions (${my_submissions?.length ?? 0})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Brief */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" /> Project Brief
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{project.brief}</p>
            </div>

            {/* Expected outcome */}
            {project.expected_outcome && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" /> Expected Outcome
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{project.expected_outcome}</p>
              </div>
            )}

            {/* Deadline */}
            {project.deadline && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-3">
                <Clock size={20} className="text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Deadline</p>
                  <p className="text-sm text-amber-700">
                    {new Date(project.deadline).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}

            {/* Team */}
            {team_roles?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" /> Team Roles
                </h2>
                <div className="space-y-2">
                  {team_roles.map((tr: any) => (
                    <div key={tr.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{tr.user?.name}</p>
                        <p className="text-xs text-gray-500">{tr.user?.email}</p>
                      </div>
                      <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full capitalize">
                        {tr.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUBMIT WORK TAB ───────────────────────────────────────────── */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Submit Your Work</h2>
            <p className="text-sm text-gray-500 mb-5">
              You can submit text, a file, or both. Your instructor will review and provide feedback.
            </p>

            {submitSuccess && (
              <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                <CheckCircle size={16} /> {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                <AlertCircle size={16} /> {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Written Submission <span className="text-gray-400 font-normal">(optional if uploading a file)</span>
                </label>
                <textarea
                  rows={6}
                  value={submitText}
                  onChange={(e) => setSubmitText(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  placeholder="Describe your work, your approach, key decisions, and any challenges you faced…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1.5">
                  Upload File <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <label className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
                  <Upload size={24} className="text-gray-400" />
                  {submitFile ? (
                    <>
                      <span className="text-sm font-medium text-gray-800 text-center">{submitFile.name}</span>
                      <span className="text-xs text-indigo-600">Click to change</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-500">Click to upload your work</span>
                      <span className="text-xs text-gray-400">PDF, DOCX, PPTX, ZIP — max 50MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                    onChange={(e) => setSubmitFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <><Send size={16} /> Submit Work</>}
              </button>
            </form>
          </div>
        )}

        {/* ── DAILY CHECK-IN TAB ────────────────────────────────────────── */}
        {activeTab === 'checkin' && (
          <div className="space-y-5">
            {checkin_today && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                <CheckCircle size={16} /> You've already submitted today's check-in. You can update it below.
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                {checkin_today ? 'Update Today\'s Check-in' : "Today's Check-in"}
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Share a quick update on what you worked on and flag any blockers.
              </p>

              {checkinSuccess && (
                <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm">
                  <CheckCircle size={16} /> {checkinSuccess}
                </div>
              )}
              {checkinError && (
                <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  <AlertCircle size={16} /> {checkinError}
                </div>
              )}

              <form onSubmit={handleCheckin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">What did you work on today? *</label>
                  <textarea
                    required
                    rows={4}
                    value={checkinText}
                    onChange={(e) => setCheckinText(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    placeholder="e.g. Completed the wireframes for the landing page, reviewed the brand guidelines…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Any blockers? <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={checkinBlocker}
                    onChange={(e) => setCheckinBlocker(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    placeholder="e.g. Waiting for feedback on the colour palette before proceeding…"
                  />
                </div>
                <button
                  type="submit"
                  disabled={checkinSubmitting}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  {checkinSubmitting
                    ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                    : <><MessageSquare size={16} /> {checkin_today ? 'Update Check-in' : 'Submit Check-in'}</>
                  }
                </button>
              </form>
            </div>

            {/* Previous checkins */}
            {my_checkins?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Previous Check-ins</h3>
                <div className="space-y-4">
                  {my_checkins.map((c: any) => (
                    <div key={c.id} className="border-l-2 border-indigo-200 pl-4 py-1">
                      <p className="text-xs text-gray-400 mb-1">
                        {new Date(c.checkin_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-sm text-gray-700">{c.update}</p>
                      {c.blocker && (
                        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mt-2">
                          🚧 Blocker: {c.blocker}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SUBMISSION HISTORY TAB ────────────────────────────────────── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {!my_submissions || my_submissions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No submissions yet.</p>
                <button
                  onClick={() => setActiveTab('submit')}
                  className="mt-4 text-sm text-indigo-600 font-semibold hover:underline"
                >
                  Submit your work →
                </button>
              </div>
            ) : my_submissions.map((sub: any) => (
              <div key={sub.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400">
                      Submitted {new Date(sub.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">Phase: {sub.phase}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
                    sub.status === 'approved'           ? 'bg-green-100 text-green-700' :
                    sub.status === 'revision_requested' ? 'bg-orange-100 text-orange-700' :
                    sub.status === 'reviewed'           ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {sub.status.replace('_', ' ')}
                  </span>
                </div>

                {sub.content && (
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 mb-3 leading-relaxed">
                    {sub.content}
                  </p>
                )}

                {sub.file_name && (
                  <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2 mb-3 w-fit">
                    <FileText size={12} /> {sub.file_name}
                  </div>
                )}

                {sub.instructor_feedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-800 mb-1"> Instructor Feedback</p>
                    <p className="text-sm text-blue-700 leading-relaxed">{sub.instructor_feedback}</p>
                    {sub.reviewed_at && (
                      <p className="text-xs text-blue-400 mt-2">
                        Reviewed {new Date(sub.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}