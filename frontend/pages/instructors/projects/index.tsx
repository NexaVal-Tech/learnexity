// pages/instructor/projects/index.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import InstructorLayout from '@/components/layouts/InstructorLayout';
import InstructorRouteGuard from '@/components/instructor/InstructorRouteGuard';
import { instructorApi, InstructorCourse, InstructorProject } from '@/lib/instructorApi';
import { FolderKanban, Loader2, ChevronRight, Clock, Plus } from 'lucide-react';

const PHASE_META: Record<string, { label: string; color: string; bg: string }> = {
  brief:     { label: 'Brief',     color: 'text-blue-700 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-500/15' },
  team:      { label: 'Team',      color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/15' },
  execution: { label: 'Execution', color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/15' },
  review:    { label: 'Review',    color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/15' },
  delivery:  { label: 'Delivery',  color: 'text-green-700 dark:text-green-400',   bg: 'bg-green-50 dark:bg-green-500/15' },
};

interface CourseWithProjects extends InstructorCourse {
  projects: InstructorProject[];
}

export default function InstructorProjectsPage() {
  const router = useRouter();
  const [coursesWithProjects, setCoursesWithProjects] = useState<CourseWithProjects[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const courses = await instructorApi.courses.getAll();
        const withProjects = await Promise.all(
          courses.map(async (course) => {
            try {
              const projects = await instructorApi.projects.getAll(course.course_id);
              return { ...course, projects };
            } catch {
              return { ...course, projects: [] };
            }
          })
        );
        // Only show courses that have at least 1 project
        setCoursesWithProjects(withProjects.filter((c) => c.projects.length > 0));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const allProjects = coursesWithProjects.flatMap((c) =>
    c.projects.map((p) => ({ ...p, course_title: c.title }))
  );

  return (
    <InstructorRouteGuard>
      <InstructorLayout>
        <div className="space-y-6">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {allProjects.length} project{allProjects.length !== 1 ? 's' : ''} across your courses
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : allProjects.length === 0 ? (
            <div className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 p-16 text-center">
              <FolderKanban size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">No projects yet</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Create a project from a course page.</p>
              <button
                onClick={() => router.push('/instructors/courses')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 mx-auto"
              >
                <Plus size={15} /> Go to Courses
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {coursesWithProjects.map((course) => (
                <div key={course.course_id}>
                  <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    {course.title}
                  </h2>
                  <div className="space-y-3">
                    {course.projects.map((project) => {
                      const meta = PHASE_META[project.phase] ?? PHASE_META.brief;
                      const phases = ['brief', 'team', 'execution', 'review', 'delivery'];
                      const phaseIndex = phases.indexOf(project.phase);

                      return (
                        <div
                          key={project.id}
                          className="bg-white dark:bg-[#0f0f14] rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => router.push(`/instructors/courses/${course.course_id}?tab=projects&project=${project.id}`)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{project.title}</h3>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                                  {meta.label}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.brief}</p>
                              {project.deadline && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-2">
                                  <Clock size={11} />
                                  Deadline: {new Date(project.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                            <ChevronRight size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-1" />
                          </div>

                          {/* Progress bar */}
                          <div className="mt-4 flex items-center gap-1">
                            {phases.map((ph, i) => (
                              <div key={ph} className="flex-1">
                                <div className={`h-1.5 rounded-full ${
                                  i < phaseIndex  ? 'bg-indigo-600' :
                                  i === phaseIndex ? 'bg-indigo-300' :
                                  'bg-gray-200 dark:bg-white/10'
                                }`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </InstructorLayout>
    </InstructorRouteGuard>
  );
}