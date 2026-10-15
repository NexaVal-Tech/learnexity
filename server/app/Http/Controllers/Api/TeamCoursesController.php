<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TeamDirectory;
use Illuminate\Http\JsonResponse;

/**
 * GET /api/courses/team-instructors — which courses each Meet Our Team
 * member teaches, keyed by lower-cased name. Used to show "Teaches" on
 * the team page.
 */
class TeamCoursesController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['courses_by_member' => (object) TeamDirectory::coursesByMember()]);
    }
}
