<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\ProjectTeamRole;
use App\Models\ProjectCheckin;
use App\Models\CourseEnrollment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class StudentProjectController extends Controller
{
    private function user()
    {
        return auth()->user();
    }

    /**
     * GET /api/student/projects
     * All active projects across enrolled courses.
     */
    public function index(): JsonResponse
    {
        $user = $this->user();

        $enrolledCourseIds = CourseEnrollment::where('user_id', $user->id)
            ->where('payment_status', 'completed')
            ->pluck('course_id');

        $projects = Project::whereIn('course_id', $enrolledCourseIds)
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($p) => $this->formatProject($p, $user->id));

        return response()->json(['projects' => $projects]);
    }

    /**
     * GET /api/student/projects/{courseId}
     * Projects for a specific course.
     */
    public function forCourse(string $courseId): JsonResponse
    {
        $user = $this->user();

        // Verify enrolled
        $enrolled = CourseEnrollment::where('user_id', $user->id)
            ->where('course_id', $courseId)
            ->where('payment_status', 'completed')
            ->exists();

        if (!$enrolled) {
            return response()->json(['message' => 'You are not enrolled in this course.'], 403);
        }

        $projects = Project::where('course_id', $courseId)
            ->where('is_active', true)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($p) => $this->formatProject($p, $user->id));

        return response()->json(['projects' => $projects]);
    }

    /**
     * GET /api/student/projects/{projectId}/detail
     * Full project detail with submissions, team, checkins.
     */
    public function show(int $projectId): JsonResponse
    {
        $user    = $this->user();
        $project = Project::findOrFail($projectId);

        $this->assertEnrolled($user->id, $project->course_id);

        $mySubmissions = ProjectSubmission::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        $myTeamRole = ProjectTeamRole::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->first();

        $teamRoles = ProjectTeamRole::where('project_id', $projectId)
            ->with('user:id,name,email')
            ->get();

        $myCheckins = ProjectCheckin::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->orderByDesc('checkin_date')
            ->get();

        $checkinToday = ProjectCheckin::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->whereDate('checkin_date', today())
            ->exists();

        return response()->json([
            'project'        => $this->formatProject($project, $user->id),
            'my_submissions' => $mySubmissions,
            'my_team_role'   => $myTeamRole,
            'team_roles'     => $teamRoles,
            'my_checkins'    => $myCheckins,
            'checkin_today'  => $checkinToday,
        ]);
    }

    /**
     * POST /api/student/projects/{projectId}/submit
     * Submit work for a project phase.
     */
    public function submit(Request $request, int $projectId): JsonResponse
    {
        $user    = $this->user();
        $project = Project::findOrFail($projectId);

        $this->assertEnrolled($user->id, $project->course_id);

        $request->validate([
            'content' => 'nullable|string|min:10',
            'file'    => 'nullable|file|max:51200',  // 50MB
            'phase'   => 'nullable|string',
        ]);

        if (!$request->filled('content') && !$request->hasFile('file')) {
            return response()->json(['message' => 'Please provide a submission — either text or a file.'], 422);
        }

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file     = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->storeAs(
                "projects/{$projectId}/submissions/{$user->id}",
                $fileName,
                'public'
            );
        }

        $submission = ProjectSubmission::create([
            'project_id' => $projectId,
            'user_id'    => $user->id,
            'phase'      => $request->phase ?? $project->phase,
            'content'    => $request->content,
            'file_path'  => $filePath,
            'file_name'  => $fileName,
            'status'     => 'submitted',
        ]);

        Log::info('📝 Student project submission', [
            'user_id'    => $user->id,
            'project_id' => $projectId,
            'phase'      => $submission->phase,
        ]);

        return response()->json([
            'message'    => 'Submission received! Your instructor will review it shortly.',
            'submission' => $submission,
        ], 201);
    }

    /**
     * POST /api/student/projects/{projectId}/checkin
     * Daily check-in update.
     */
    public function checkin(Request $request, int $projectId): JsonResponse
    {
        $user    = $this->user();
        $project = Project::findOrFail($projectId);

        $this->assertEnrolled($user->id, $project->course_id);

        $request->validate([
            'update'  => 'required|string|min:10|max:1000',
            'blocker' => 'nullable|string|max:500',
        ]);

        // One check-in per day per project
        $existing = ProjectCheckin::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->whereDate('checkin_date', today())
            ->first();

        if ($existing) {
            // Update today's check-in instead of creating a new one
            $existing->update([
                'update'  => $request->update,
                'blocker' => $request->blocker,
            ]);
            return response()->json(['message' => "Today's check-in updated.", 'checkin' => $existing]);
        }

        $checkin = ProjectCheckin::create([
            'project_id'   => $projectId,
            'user_id'      => $user->id,
            'update'       => $request->update,
            'blocker'      => $request->blocker,
            'checkin_date' => today(),
        ]);

        return response()->json([
            'message' => 'Check-in submitted successfully!',
            'checkin' => $checkin,
        ], 201);
    }

    /**
     * GET /api/student/projects/{projectId}/submissions
     * Student's own submissions for a project.
     */
    public function mySubmissions(int $projectId): JsonResponse
    {
        $user = $this->user();

        $submissions = ProjectSubmission::where('project_id', $projectId)
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['submissions' => $submissions]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function assertEnrolled(int $userId, string $courseId): void
    {
        $enrolled = CourseEnrollment::where('user_id', $userId)
            ->where('course_id', $courseId)
            ->where('payment_status', 'completed')
            ->exists();

        if (!$enrolled) abort(403, 'You are not enrolled in this course.');
    }

    private function formatProject(Project $p, int $userId): array
    {
        $hasSubmitted = ProjectSubmission::where('project_id', $p->id)
            ->where('user_id', $userId)
            ->exists();

        $latestSubmission = ProjectSubmission::where('project_id', $p->id)
            ->where('user_id', $userId)
            ->latest()
            ->first();

        $teamRole = ProjectTeamRole::where('project_id', $p->id)
            ->where('user_id', $userId)
            ->value('role');

        $checkinToday = ProjectCheckin::where('project_id', $p->id)
            ->where('user_id', $userId)
            ->whereDate('checkin_date', today())
            ->exists();

        return [
            'id'                => $p->id,
            'title'             => $p->title,
            'brief'             => $p->brief,
            'expected_outcome'  => $p->expected_outcome,
            'deadline'          => $p->deadline?->toDateString(),
            'phase'             => $p->phase,
            'course_id'         => $p->course_id,
            'is_active'         => $p->is_active,
            'created_at'        => $p->created_at,
            'has_submitted'     => $hasSubmitted,
            'latest_submission' => $latestSubmission,
            'my_role'           => $teamRole,
            'checkin_today'     => $checkinToday,
        ];
    }
}