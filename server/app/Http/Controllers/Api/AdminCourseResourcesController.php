<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\CourseMaterial;
use App\Models\MaterialItem;
use App\Models\ExternalResource;
use App\Models\AchievementBadge;
use App\Models\CohortLeaderboard;
use App\Models\CohortParticipant;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class AdminCourseResourcesController extends Controller
{
    // ===== COURSE MATERIALS =====
    
    public function createMaterial(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'sprint_name' => 'required|string|max:255',
            'sprint_number' => 'required|integer|min:1',
            'order' => 'integer|min:0',
        ]);

        $material = CourseMaterial::create([
            'course_id' => $courseId,
            'sprint_name' => $validated['sprint_name'],
            'sprint_number' => $validated['sprint_number'],
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Course material created successfully',
            'material' => $material,
        ], 201);
    }

    public function updateMaterial(Request $request, string $courseId, int $materialId): JsonResponse
    {
        $validated = $request->validate([
            'sprint_name' => 'string|max:255',
            'sprint_number' => 'integer|min:1',
            'order' => 'integer|min:0',
        ]);

        $material = CourseMaterial::where('course_id', $courseId)
            ->findOrFail($materialId);

        $material->update($validated);

        return response()->json([
            'message' => 'Course material updated successfully',
            'material' => $material,
        ]);
    }

    public function deleteMaterial(string $courseId, int $materialId): JsonResponse
    {
        $material = CourseMaterial::where('course_id', $courseId)
            ->findOrFail($materialId);

        // Delete all associated files
        foreach ($material->items as $item) {
            if ($item->file_path && Storage::exists($item->file_path)) {
                Storage::delete($item->file_path);
            }
        }

        $material->delete();

        return response()->json([
            'message' => 'Course material deleted successfully',
        ]);
    }

    // ===== MATERIAL ITEMS =====
    
    public function addMaterialItem(Request $request, string $courseId, int $materialId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|in:pdf,video,document,link',
            'file_url' => 'nullable|url',
            'file_size' => 'nullable|string',
            'order' => 'integer|min:0',
        ]);

        $material = CourseMaterial::where('course_id', $courseId)
            ->findOrFail($materialId);

        $item = MaterialItem::create([
            'course_material_id' => $material->id,
            'title' => $validated['title'],
            'type' => $validated['type'],
            'file_url' => $validated['file_url'] ?? null,
            'file_size' => $validated['file_size'] ?? null,
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Material item added successfully',
            'item' => $item,
        ], 201);
    }

    public function updateMaterialItem( Request $request, string $courseId, int $itemId ): JsonResponse {

        $validated = $request->validate([
            'title' => 'string|max:255',
            'type' => 'in:pdf,video,document,link',
            'file_url' => 'nullable|url',
            'file_size' => 'nullable|string',
            'order' => 'integer|min:0',
        ]);

        $item = MaterialItem::findOrFail($itemId);
        $item->update($validated);

        return response()->json([
            'message' => 'Material item updated successfully',
            'item' => $item,
        ]);
    }


    public function deleteMaterialItem( string $courseId, int $itemId  ): JsonResponse {
        
        $item = MaterialItem::findOrFail($itemId);

        if ($item->file_path && Storage::exists($item->file_path)) {
            Storage::delete($item->file_path);
        }

        $item->delete();

        return response()->json([
            'message' => 'Material item deleted successfully',
        ]);
    }


    public function uploadMaterialFile(Request $request, string $courseId, int $itemId ): JsonResponse {

        Log::info('Material file upload started', [
            'course_id' => $courseId,
            'item_id' => $itemId,
            'has_file' => $request->hasFile('file'),
        ]);

        $request->validate([
            'file' => 'required|file|max:51200',
        ]);

        $item = MaterialItem::findOrFail($itemId);
        
        // Get the course material to organize files by sprint
        $courseMaterial = $item->courseMaterial;

        Log::info('Material item found', [
            'item_id' => $item->id,
            'existing_file' => $item->file_path,
            'sprint_name' => $courseMaterial->sprint_name,
        ]);

        // Delete old file if exists
        if ($item->file_path && Storage::disk('public')->exists($item->file_path)) {
            Storage::disk('public')->delete($item->file_path);
            Log::info('Old material file deleted', ['path' => $item->file_path]);
        }

        // Store new file with organized path structure
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        
        // Create organized path: courses/{course_id}/sprint{number}/{filename}
        $sprintFolder = 'sprint' . $courseMaterial->sprint_number;
        $path = $file->storeAs(
            "courses/{$courseId}/{$sprintFolder}",
            $originalName,
            'public'
        );

        Log::info('New material file stored', ['path' => $path]);

        // Get file size in readable format
        $fileSize = $this->formatBytes($file->getSize());

        $item->update([
            'file_path' => $path,
            'file_size' => $fileSize,
            'file_url' => Storage::url($path), // Store the full URL
        ]);

        Log::info('Material item updated successfully', [
            'item_id' => $item->id,
            'file_size' => $fileSize,
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'file_path' => $path,
            'file_size' => $fileSize,
            'download_url' => Storage::url($path),
        ]);
    }


    // ===== EXTERNAL RESOURCES =====
    
    public function createExternalResource(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|in:video_tutorials,industry_articles,recommended_reading',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'url' => 'required|url',
            'source' => 'required|string|max:255',
            'duration' => 'nullable|string',
            'order' => 'integer|min:0',
        ]);

        $resource = ExternalResource::create([
            'course_id' => $courseId,
            ...$validated,
            'order' => $validated['order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'External resource created successfully',
            'resource' => $resource,
        ], 201);
    }

    public function updateExternalResource(Request $request, string $courseId, int $resourceId): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'in:video_tutorials,industry_articles,recommended_reading',
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'url' => 'url',
            'source' => 'string|max:255',
            'duration' => 'nullable|string',
            'order' => 'integer|min:0',
        ]);

        $resource = ExternalResource::where('course_id', $courseId)
            ->findOrFail($resourceId);

        $resource->update($validated);

        return response()->json([
            'message' => 'External resource updated successfully',
            'resource' => $resource,
        ]);
    }

    public function deleteExternalResource(string $courseId, int $resourceId): JsonResponse
    {
        $resource = ExternalResource::where('course_id', $courseId)
            ->findOrFail($resourceId);

        $resource->delete();

        return response()->json([
            'message' => 'External resource deleted successfully',
        ]);
    }

    // ===== ACHIEVEMENT BADGES =====
    
    public function createBadge(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'badge_color' => 'required|string',
            'unlock_type' => 'required|in:sprint_completion,course_completion,milestone',
            'unlock_value' => 'required|integer|min:1',
        ]);

        $badge = AchievementBadge::create([
            'course_id' => $courseId,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Achievement badge created successfully',
            'badge' => $badge,
        ], 201);
    }

    public function updateBadge(Request $request, string $courseId, int $badgeId): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'string',
            'badge_color' => 'string',
            'unlock_type' => 'in:sprint_completion,course_completion,milestone',
            'unlock_value' => 'integer|min:1',
        ]);

        $badge = AchievementBadge::where('course_id', $courseId)
            ->findOrFail($badgeId);

        $badge->update($validated);

        return response()->json([
            'message' => 'Achievement badge updated successfully',
            'badge' => $badge,
        ]);
    }

    public function deleteBadge(string $courseId, int $badgeId): JsonResponse
    {
        $badge = AchievementBadge::where('course_id', $courseId)
            ->findOrFail($badgeId);

        $badge->delete();

        return response()->json([
            'message' => 'Achievement badge deleted successfully',
        ]);
    }

    // ===== COHORT LEADERBOARD =====
    
    public function createCohort(Request $request, string $courseId): JsonResponse
    {
        $validated = $request->validate([
            'cohort_name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $cohort = CohortLeaderboard::create([
            'course_id' => $courseId,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Cohort created successfully',
            'cohort' => $cohort,
        ], 201);
    }

    public function updateCohort(Request $request, string $courseId, int $cohortId): JsonResponse
    {
        $validated = $request->validate([
            'cohort_name' => 'string|max:255',
            'start_date' => 'date',
            'end_date' => 'nullable|date',
        ]);

        $cohort = CohortLeaderboard::where('course_id', $courseId)
            ->findOrFail($cohortId);

        $cohort->update($validated);

        return response()->json([
            'message' => 'Cohort updated successfully',
            'cohort' => $cohort,
        ]);
    }

    public function addParticipant(Request $request, string $courseId, int $cohortId): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'rank' => 'integer|min:1',
            'sprint1_score' => 'numeric|min:0|max:100',
            'sprint2_score' => 'numeric|min:0|max:100',
            'sprint3_score' => 'numeric|min:0|max:100',
            'sprint4_score' => 'numeric|min:0|max:100',
            'overall_score' => 'numeric|min:0|max:100',
        ]);

        $cohort = CohortLeaderboard::where('course_id', $courseId)
            ->findOrFail($cohortId);

        $participant = CohortParticipant::create([
            'cohort_leaderboard_id' => $cohort->id,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Participant added successfully',
            'participant' => $participant->load('user'),
        ], 201);
    }

    public function updateParticipant(Request $request, int $participantId): JsonResponse
    {
        $validated = $request->validate([
            'rank' => 'integer|min:1',
            'sprint1_score' => 'numeric|min:0|max:100',
            'sprint2_score' => 'numeric|min:0|max:100',
            'sprint3_score' => 'numeric|min:0|max:100',
            'sprint4_score' => 'numeric|min:0|max:100',
            'overall_score' => 'numeric|min:0|max:100',
        ]);

        $participant = CohortParticipant::findOrFail($participantId);
        $participant->update($validated);

        return response()->json([
            'message' => 'Participant updated successfully',
            'participant' => $participant->load('user'),
        ]);
    }

    public function removeParticipant(int $participantId): JsonResponse
    {
        $participant = CohortParticipant::findOrFail($participantId);
        $participant->delete();

        return response()->json([
            'message' => 'Participant removed successfully',
        ]);
    }

    // ===== HELPER METHODS =====
    
    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }
}