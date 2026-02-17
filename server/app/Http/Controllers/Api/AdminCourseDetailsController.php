<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Course;
use App\Models\CourseTool;
use App\Models\CourseLearning;
use App\Models\CourseBenefit;
use App\Models\CourseCareerPath;
use App\Models\CourseIndustry;
use App\Models\CourseSalary;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminCourseDetailsController extends Controller
{
    /**
     * Add tools to a course with icon upload
     */
    public function addTool(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048', // Accept image file
            'order' => 'integer|min:0',
        ]);

        $course = Course::where('course_id', $courseId)->firstOrFail();

        // Handle icon upload
        $iconPath = null;
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('tools', 'public');
        }

        $tool = CourseTool::create([
            'course_id' => $course->course_id,
            'name' => $validated['name'],
            'icon' => $iconPath ? "/storage/{$iconPath}" : null,
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tool added successfully',
            'tool' => $tool,
        ], 201);
    }

    /**
     * Add learning point to a course
     */
    public function addLearning(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'learning_point' => 'required|string',
            'order' => 'integer|min:0',
        ]);

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $learning = CourseLearning::create([
            'course_id' => $course->course_id,
            'learning_point' => $validated['learning_point'],
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Learning point added successfully',
            'learning' => $learning,
        ], 201);
    }

    /**
     * Add benefit to a course
     */
    public function addBenefit(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'required|string',
            'order' => 'integer|min:0',
        ]);

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $benefit = CourseBenefit::create([
            'course_id' => $course->course_id,
            'title' => $validated['title'],
            'text' => $validated['text'],
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Benefit added successfully',
            'benefit' => $benefit,
        ], 201);
    }

    /**
     * Add career path to a course
     */
    public function addCareerPath(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'level' => 'required|in:entry,mid,advanced,specialized',
            'position' => 'required|string|max:255',
            'order' => 'integer|min:0',
        ]);

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $careerPath = CourseCareerPath::create([
            'course_id' => $course->course_id,
            'level' => $validated['level'],
            'position' => $validated['position'],
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Career path added successfully',
            'career_path' => $careerPath,
        ], 201);
    }

    /**
     * Add industry to a course
     */
    public function addIndustry(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'text' => 'required|string',
            'order' => 'integer|min:0',
        ]);

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $industry = CourseIndustry::create([
            'course_id' => $course->course_id,
            'title' => $validated['title'],
            'text' => $validated['text'],
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Industry added successfully',
            'industry' => $industry,
        ], 201);
    }

    /**
     * Add or update salary information for a course
     */
    public function addSalary(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'entry_level' => 'nullable|string',
            'mid_level' => 'nullable|string',
            'senior_level' => 'nullable|string',
        ]);

        $course = Course::where('course_id', $courseId)->firstOrFail();

        // Check if salary info already exists
        $salary = CourseSalary::where('course_id', $course->course_id)->first();

        if ($salary) {
            // Update existing
            $salary->update($validated);
            $message = 'Salary information updated successfully';
        } else {
            // Create new
            $salary = CourseSalary::create([
                'course_id' => $course->course_id,
                'entry_level' => $validated['entry_level'],
                'mid_level' => $validated['mid_level'],
                'senior_level' => $validated['senior_level'],
            ]);
            $message = 'Salary information added successfully';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'salary' => $salary,
        ], 201);
    }

    /**
     * Get all course details
     */
    public function getCourseDetails(string $courseId): JsonResponse
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
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'course' => $course,
        ]);
    }

    /**
     * Delete tool
     */
    public function deleteTool(string $courseId, int $toolId): JsonResponse
    {
        $tool = CourseTool::where('course_id', $courseId)
            ->where('id', $toolId)
            ->firstOrFail();

        // Delete icon file if exists
        if ($tool->icon) {
            $iconPath = str_replace('/storage/', '', $tool->icon);
            Storage::disk('public')->delete($iconPath);
        }

        $tool->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tool deleted successfully',
        ]);
    }

    /**
     * Delete learning point
     */
    public function deleteLearning(string $courseId, int $learningId): JsonResponse
    {
        $learning = CourseLearning::where('course_id', $courseId)
            ->where('id', $learningId)
            ->firstOrFail();

        $learning->delete();

        return response()->json([
            'success' => true,
            'message' => 'Learning point deleted successfully',
        ]);
    }

    /**
     * Delete benefit
     */
    public function deleteBenefit(string $courseId, int $benefitId): JsonResponse
    {
        $benefit = CourseBenefit::where('course_id', $courseId)
            ->where('id', $benefitId)
            ->firstOrFail();

        $benefit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Benefit deleted successfully',
        ]);
    }

    /**
     * Delete career path
     */
    public function deleteCareerPath(string $courseId, int $careerPathId): JsonResponse
    {
        $careerPath = CourseCareerPath::where('course_id', $courseId)
            ->where('id', $careerPathId)
            ->firstOrFail();

        $careerPath->delete();

        return response()->json([
            'success' => true,
            'message' => 'Career path deleted successfully',
        ]);
    }

    /**
     * Delete industry
     */
    public function deleteIndustry(string $courseId, int $industryId): JsonResponse
    {
        $industry = CourseIndustry::where('course_id', $courseId)
            ->where('id', $industryId)
            ->firstOrFail();

        $industry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Industry deleted successfully',
        ]);
    }
}