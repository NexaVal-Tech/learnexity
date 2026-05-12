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
     * Add a tool to a course with optional icon upload
     */
    public function addTool(Request $request, string $courseId): JsonResponse
    {
        // ── DEBUG ──────────────────────────────────────────────────────────────
        Log::info('📝 [addTool] Called for courseId: ' . $courseId);
        Log::info('📝 [addTool] Content-Type: ' . $request->header('Content-Type'));
        Log::info('📝 [addTool] All input keys: ' . implode(', ', array_keys($request->all())));
        Log::info('📝 [addTool] All input values (no file): ', $request->except(['icon']));
        Log::info('📝 [addTool] Files received: ' . implode(', ', array_keys($request->allFiles())));
        Log::info('📝 [addTool] Has file "icon": ' . ($request->hasFile('icon') ? 'YES' : 'NO'));
        Log::info('📝 [addTool] "name" value: ' . json_encode($request->input('name')));
        Log::info('📝 [addTool] "order" value: ' . json_encode($request->input('order')));

        if ($request->hasFile('icon')) {
            $file = $request->file('icon');
            Log::info('📝 [addTool] icon file details: ', [
                'original_name' => $file->getClientOriginalName(),
                'mime'          => $file->getMimeType(),
                'size'          => $file->getSize(),
                'valid'         => $file->isValid(),
                'error'         => $file->getError(),
            ]);
        }
        // ── END DEBUG ──────────────────────────────────────────────────────────

        try {
            $validated = $request->validate([
                'name'  => 'required|string|max:255',
                'icon'  => $request->hasFile('icon') 
                            ? 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048' 
                            : 'nullable',
                'order' => 'nullable|integer|min:0',
            ]);

            Log::info('✅ [addTool] Validation passed', ['validated' => array_keys($validated)]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [addTool] Validation FAILED', [
                'errors'    => $e->errors(),
                'all_input' => $request->except(['icon']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $iconPath = null;
        if ($request->hasFile('icon')) {
            $iconPath = $request->file('icon')->store('course-tools', 'public');
            Log::info('📝 [addTool] Icon stored at: ' . $iconPath);
        }

        $tool = CourseTool::create([
            'course_id' => $course->id,
            'name'      => $validated['name'],
            'icon'      => $iconPath,
            'order'     => $validated['order'] ?? 0,
        ]);

        Log::info('✅ [addTool] Tool created', ['tool_id' => $tool->id, 'name' => $tool->name]);

        return response()->json([
            'success' => true,
            'message' => 'Tool added successfully',
            'tool'    => $tool,
        ], 201);
    }

    /**
     * Add learning point to a course
     */
    public function addLearning(Request $request, string $courseId): JsonResponse
    {
        Log::info('📝 [addLearning] courseId: ' . $courseId . ' | input: ' . json_encode($request->all()));

        try {
            $validated = $request->validate([
                'learning_point' => 'required|string',
                'order'          => 'nullable|integer|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [addLearning] Validation FAILED', ['errors' => $e->errors(), 'input' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $learning = CourseLearning::create([
            'course_id'      => $course->id,
            'learning_point' => $validated['learning_point'],
            'order'          => $validated['order'] ?? 0,
        ]);

        Log::info('✅ [addLearning] Created id: ' . $learning->id);

        return response()->json([
            'success'  => true,
            'message'  => 'Learning point added successfully',
            'learning' => $learning,
        ], 201);
    }

    /**
     * Add benefit to a course
     */
    public function addBenefit(Request $request, string $courseId): JsonResponse
    {
        Log::info('📝 [addBenefit] courseId: ' . $courseId . ' | input: ' . json_encode($request->all()));

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'text'  => 'required|string',
                'order' => 'nullable|integer|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [addBenefit] Validation FAILED', ['errors' => $e->errors(), 'input' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $benefit = CourseBenefit::create([
            'course_id' => $course->id,
            'title'     => $validated['title'],
            'text'      => $validated['text'],
            'order'     => $validated['order'] ?? 0,
        ]);

        Log::info('✅ [addBenefit] Created id: ' . $benefit->id);

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
        Log::info('📝 [addCareerPath] courseId: ' . $courseId . ' | input: ' . json_encode($request->all()));

        try {
            $validated = $request->validate([
                'level'    => 'required|in:entry,mid,advanced,specialized',
                'position' => 'required|string|max:255',
                'order'    => 'nullable|integer|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [addCareerPath] Validation FAILED', ['errors' => $e->errors(), 'input' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $careerPath = CourseCareerPath::create([
            'course_id' => $course->id,
            'level'     => $validated['level'],
            'position'  => $validated['position'],
            'order'     => $validated['order'] ?? 0,
        ]);

        Log::info('✅ [addCareerPath] Created id: ' . $careerPath->id);

        return response()->json([
            'success'     => true,
            'message'     => 'Career path added successfully',
            'career_path' => $careerPath,
        ], 201);
    }

    /**
     * Add industry to a course
     */
    public function addIndustry(Request $request, string $courseId): JsonResponse
    {
        Log::info('📝 [addIndustry] courseId: ' . $courseId . ' | input: ' . json_encode($request->all()));

        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'text'  => 'required|string',
                'order' => 'nullable|integer|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [addIndustry] Validation FAILED', ['errors' => $e->errors(), 'input' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $industry = CourseIndustry::create([
            'course_id' => $course->id,
            'title'     => $validated['title'],
            'text'      => $validated['text'],
            'order'     => $validated['order'] ?? 0,
        ]);

        Log::info('✅ [addIndustry] Created id: ' . $industry->id);

        return response()->json([
            'success'  => true,
            'message'  => 'Industry added successfully',
            'industry' => $industry,
        ], 201);
    }

    /**
     * Add or update salary information for a course
     */
    public function addSalary(Request $request, string $courseId): JsonResponse
    {
        Log::info('📝 [addSalary] courseId: ' . $courseId . ' | input: ' . json_encode($request->all()));

        try {
            $validated = $request->validate([
                'entry_level'  => 'nullable|string',
                'mid_level'    => 'nullable|string',
                'senior_level' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('❌ [addSalary] Validation FAILED', ['errors' => $e->errors(), 'input' => $request->all()]);
            return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => $e->errors()], 422);
        }

        $course = Course::where('course_id', $courseId)->firstOrFail();

        $salary = CourseSalary::where('course_id', $course->id)->first();

        if ($salary) {
            $salary->update($validated);
            $message = 'Salary information updated successfully';
            Log::info('✅ [addSalary] Updated existing salary id: ' . $salary->id);
        } else {
            $salary = CourseSalary::create([
                'course_id'   => $course->id,
                'entry_level' => $validated['entry_level'] ?? null,
                'mid_level'   => $validated['mid_level'] ?? null,
                'senior_level'=> $validated['senior_level'] ?? null,
            ]);
            $message = 'Salary information added successfully';
            Log::info('✅ [addSalary] Created salary id: ' . $salary->id);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'salary'  => $salary,
        ], 201);
    }

    /**
     * Get all course details
     */
    public function getCourseDetails(string $courseId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)
            ->with(['tools', 'learnings', 'benefits', 'careerPaths', 'industries', 'salary'])
            ->firstOrFail();

        return response()->json([
            'success'      => true,
            'tools'        => $course->tools,
            'learnings'    => $course->learnings,
            'benefits'     => $course->benefits,
            'career_paths' => $course->careerPaths,
            'industries'   => $course->industries,
            'salary'       => $course->salary,
        ]);
    }

    /**
     * Delete tool
     */
    public function deleteTool(string $courseId, int $toolId): JsonResponse
    {
        $course = Course::where('course_id', $courseId)->firstOrFail();

        $tool = CourseTool::where('course_id', $course->id)
            ->where('id', $toolId)
            ->firstOrFail();

        if ($tool->icon) {
            Storage::disk('public')->delete($tool->icon);
        }

        $tool->delete();

        return response()->json(['success' => true, 'message' => 'Tool deleted successfully']);
    }

    /**
     * Delete learning point
     */
    public function deleteLearning(string $courseId, int $learningId): JsonResponse
    {
        $course   = Course::where('course_id', $courseId)->firstOrFail();
        $learning = CourseLearning::where('course_id', $course->id)->where('id', $learningId)->firstOrFail();
        $learning->delete();

        return response()->json(['success' => true, 'message' => 'Learning point deleted successfully']);
    }

    /**
     * Delete benefit
     */
    public function deleteBenefit(string $courseId, int $benefitId): JsonResponse
    {
        $course  = Course::where('course_id', $courseId)->firstOrFail();
        $benefit = CourseBenefit::where('course_id', $course->id)->where('id', $benefitId)->firstOrFail();
        $benefit->delete();

        return response()->json(['success' => true, 'message' => 'Benefit deleted successfully']);
    }

    /**
     * Delete career path
     */
    public function deleteCareerPath(string $courseId, int $careerPathId): JsonResponse
    {
        $course     = Course::where('course_id', $courseId)->firstOrFail();
        $careerPath = CourseCareerPath::where('course_id', $course->id)->where('id', $careerPathId)->firstOrFail();
        $careerPath->delete();

        return response()->json(['success' => true, 'message' => 'Career path deleted successfully']);
    }

    /**
     * Delete industry
     */
    public function deleteIndustry(string $courseId, int $industryId): JsonResponse
    {
        $course   = Course::where('course_id', $courseId)->firstOrFail();
        $industry = CourseIndustry::where('course_id', $course->id)->where('id', $industryId)->firstOrFail();
        $industry->delete();

        return response()->json(['success' => true, 'message' => 'Industry deleted successfully']);
    }
}