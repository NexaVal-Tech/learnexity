<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::with([
            'tools', 'learnings', 'benefits',
            'careerPaths', 'industries', 'salary'
        ]);

        // ✅ FIX: Clamp limit to max 50, default 10
        if ($request->has('limit')) {
            $limit = min(abs((int) $request->input('limit', 10)), 50);
            $query->limit($limit);
        }

        return response()->json($query->get());
    }

    public function show(string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)
            ->with(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary'])
            ->first();

        if (!$course) {
            return response()->json(['message' => 'Course not found'], 404);
        }

        return response()->json($course);
    }

    public function featured(): JsonResponse
    {
        $courses = Course::where('is_premium', true)
            ->with(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary'])
            ->limit(4)
            ->get();

        return response()->json($courses);
    }

    public function freemium(): JsonResponse
    {
        $courses = Course::where('is_freemium', true)
            ->with(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary'])
            ->get();

        return response()->json($courses);
    }

    public function search(Request $request): JsonResponse
    {
        // ✅ FIX: Validate and limit search term length
        $request->validate([
            'q' => 'required|string|min:1|max:100',
        ]);

        $searchTerm = $request->input('q');

        $courses = Course::where('title', 'LIKE', "%{$searchTerm}%")
            ->orWhere('description', 'LIKE', "%{$searchTerm}%")
            ->with(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary'])
            ->limit(50) // ✅ FIX: Always cap search results
            ->get();

        return response()->json($courses);
    }
}