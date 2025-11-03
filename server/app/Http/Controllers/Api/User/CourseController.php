<?php
namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use Illuminate\Http\JsonResponse;

class CourseController extends Controller
{
    /**
     * Get all courses with relationships
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::with([
            'tools',
            'learnings',
            'benefits',
            'careerPaths',
            'industries',
            'salary'
        ]);

        // Optional limit parameter for featured courses
        if ($request->has('limit')) {
            $query->limit((int) $request->limit);
        }

        $courses = $query->get();

        return response()->json($courses);
    }

    /**
     * Get a single course by course_id
     */
    public function show(string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)
            ->with([
                'tools',
                'learnings',
                'benefits',
                'careerPaths',
                'industries',
                'salary'
            ])
            ->first();

        if (!$course) {
            return response()->json([
                'message' => 'Course not found'
            ], 404);
        }

        return response()->json($course);
    }

    /**
     * Get featured/premium courses
     */
    public function featured(): JsonResponse
    {
        $courses = Course::where('is_premium', true)
            ->with([
                'tools',
                'learnings',
                'benefits',
                'careerPaths',
                'industries',
                'salary'
            ])
            ->limit(4)
            ->get();

        return response()->json($courses);
    }

    /**
     * Get freemium courses
     */
    public function freemium(): JsonResponse
    {
        $courses = Course::where('is_freemium', true)
            ->with([
                'tools',
                'learnings',
                'benefits',
                'careerPaths',
                'industries',
                'salary'
            ])
            ->get();

        return response()->json($courses);
    }

    /**
     * Search courses
     */
    public function search(Request $request): JsonResponse
    {
        $searchTerm = $request->input('q');

        $courses = Course::where('title', 'LIKE', "%{$searchTerm}%")
            ->orWhere('description', 'LIKE', "%{$searchTerm}%")
            ->with([
                'tools',
                'learnings',
                'benefits',
                'careerPaths',
                'industries',
                'salary'
            ])
            ->get();

        return response()->json($courses);
    }
}