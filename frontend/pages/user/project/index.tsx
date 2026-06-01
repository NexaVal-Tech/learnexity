// pages/user/projects/index.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  FolderKanban, Clock, CheckCircle, ChevronRight,
  Loader2, AlertCircle, ArrowRight,
} from 'lucide-react';

const PHASE_META: Record<string, { label: string; color: string; bg: string; step: number }> = {
  brief:     { label: 'Project Brief',   color: 'text-blue-700',   bg: 'bg-blue-50',   step: 1 },
  team:      { label: 'Team Assignment', color: 'text-violet-700', bg: 'bg-violet-50', step: 2 },
  execution: { label: 'Execution',       color: 'text-amber-700',  bg: 'bg-amber-50',  step: 3 },
  review:    { label: 'Review',          color: 'text-orange-700', bg: 'bg-orange-50', step: 4 },
  delivery:  { label: 'Delivery',        color: 'text-green-700',  bg: 'bg-green-50',  step: 5 },
};

const PHASES = ['brief', 'team', 'execution', 'review', 'delivery'];

export default function StudentProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/api/student/projects')
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserDashboardLayout>
      <div className="max-w-[1255px] mx-auto px-4 py-8 pt-25">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-500 text-sm mt-1">
            View project briefs, submit your work and track feedback from your instructor.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <FolderKanban size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-1">No projects yet</h2>
            <p className="text-sm text-gray-500">Your instructor hasn't assigned any projects yet. Check back soon.</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="space-y-4">
            {projects.map((project) => {
              const meta  = PHASE_META[project.phase] ?? PHASE_META.brief;
              const phaseIndex = PHASES.indexOf(project.phase);

              return (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer p-6"
                  onClick={() => router.push(`/user/project/${project.id}`)}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h2 className="text-lg font-bold text-gray-900">{project.title}</h2>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                          {meta.label}
                        </span>
                        {project.has_submitted && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                            <CheckCircle size={11} /> Submitted
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.brief}</p>

                      {project.deadline && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                          <Clock size={11} />
                          Deadline: {new Date(project.deadline).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric',
                          })}
                        </p>
                      )}

                      {project.my_role && (
                        <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full">
                          Your role: {project.my_role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 flex-shrink-0">
                      View & Submit <ArrowRight size={16} />
                    </div>
                  </div>

                  {/* Phase progress bar */}
                  <div className="mt-5 flex items-center gap-1">
                    {PHASES.map((ph, i) => {
                      const isDone    = i < phaseIndex;
                      const isCurrent = i === phaseIndex;
                      const phMeta    = PHASE_META[ph];
                      return (
                        <div key={ph} className="flex-1">
                          <div className={`h-1.5 rounded-full transition-all ${
                            isDone    ? 'bg-indigo-600' :
                            isCurrent ? 'bg-indigo-300' :
                            'bg-gray-200'
                          }`} />
                          <p className="text-[10px] text-gray-400 mt-1 text-center capitalize hidden sm:block">
                            {phMeta.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}