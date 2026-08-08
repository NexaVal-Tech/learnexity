<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Admin-only course grouping — e.g. "Data Analysis" as a group containing
 * several related courses (data-viz, SQL, Python for data, etc). One group
 * can hold many courses; a course can also stand alone with no group at
 * all. Purely organizational for now — there's no user-facing display of
 * groups yet, this only powers the admin course list/settings.
 */
class AdminCourseGroupController extends Controller
{
    /**
     * List all groups, each with its courses (id/course_id/title only —
     * enough for the admin UI to show membership without a heavy payload).
     */
    public function index(): JsonResponse
    {
        $groups = CourseGroup::withCount('courses')
            ->with(['courses:id,course_id,title,course_group_id'])
            ->orderBy('name')
            ->get();

        $ungroupedCount = Course::whereNull('course_group_id')->count();

        return response()->json([
            'groups'          => $groups,
            'ungrouped_count' => $ungroupedCount,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $group = CourseGroup::create($validator->validated());

        return response()->json(['message' => 'Course group created', 'group' => $group], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $group = CourseGroup::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|required|string|max:150',
            'description' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $group->update($validator->validated());

        return response()->json(['message' => 'Course group updated', 'group' => $group]);
    }

    /**
     * Deleting a group never deletes its courses — the FK is nullOnDelete,
     * so every member course just becomes ungrouped/standalone again.
     */
    public function destroy(int $id): JsonResponse
    {
        $group = CourseGroup::findOrFail($id);
        $group->delete();

        return response()->json(['message' => 'Course group deleted — its courses are now ungrouped, not deleted']);
    }

    /**
     * Bulk-add existing courses to this group. Accepts an array of the
     * courses' string course_id (not the numeric PK) since that's what the
     * rest of the admin course UI addresses courses by.
     */
    public function assignCourses(Request $request, int $id): JsonResponse
    {
        $group = CourseGroup::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'course_ids'   => 'required|array|min:1',
            'course_ids.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $updated = Course::whereIn('course_id', $request->input('course_ids'))
            ->update(['course_group_id' => $group->id]);

        return response()->json([
            'message' => "{$updated} course(s) added to \"{$group->name}\"",
            'group'   => $group->fresh(['courses:id,course_id,title,course_group_id']),
        ]);
    }

    /**
     * Remove a single course from its group — it goes back to standing
     * alone, it is never deleted.
     */
    public function removeCourse(Request $request, int $id, string $courseId): JsonResponse
    {
        $group  = CourseGroup::findOrFail($id);
        $course = Course::where('course_id', $courseId)->where('course_group_id', $group->id)->first();

        if (! $course) {
            return response()->json(['message' => 'Course is not in this group'], 404);
        }

        $course->update(['course_group_id' => null]);

        return response()->json(['message' => 'Course removed from group — it now stands alone']);
    }
}
