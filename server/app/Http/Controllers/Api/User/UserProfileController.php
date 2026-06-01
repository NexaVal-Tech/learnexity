<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserProfileController extends Controller
{
    // GET /api/profile
    public function show()
    {
        $user = auth()->user();

        UserActivityLog::record($user->id, 'profile_viewed', 'user', $user->id);

        return response()->json([
            'user' => $user->only([
                'id', 'name', 'email', 'phone',
                'avatar', 'bio', 'location',
                'linkedin_url', 'twitter_url', 'github_url', 'website_url',
                'email_verified_at', 'created_at',
                'google_id',
            ]),
        ]);
    }

    // PUT /api/profile
    public function update(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'name'          => 'sometimes|string|max:255',
            'phone'         => 'nullable|string|max:20',
            'bio'           => 'nullable|string|max:500',
            'location'      => 'nullable|string|max:100',
            'linkedin_url'  => 'nullable|url|max:255',
            'twitter_url'   => 'nullable|url|max:255',
            'github_url'    => 'nullable|url|max:255',
            'website_url'   => 'nullable|url|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $before = $user->only(['name', 'phone', 'bio', 'location']);

        $user->update($request->only([
            'name', 'phone', 'bio', 'location',
            'linkedin_url', 'twitter_url', 'github_url', 'website_url',
        ]));

        UserActivityLog::record($user->id, 'profile_updated', 'user', $user->id, [
            'before' => $before,
            'after'  => $user->fresh()->only(['name', 'phone', 'bio', 'location']),
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user->fresh(),
        ]);
    }

    // POST /api/profile/avatar
    public function uploadAvatar(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Delete old avatar if it's a stored file
        if ($user->avatar && str_starts_with($user->avatar, 'avatars/')) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $url  = Storage::disk('public')->url($path);

        $user->update(['avatar' => $path]);

        UserActivityLog::record($user->id, 'avatar_uploaded', 'user', $user->id);

        return response()->json([
            'message'    => 'Avatar uploaded successfully.',
            'avatar_url' => $url,
        ]);
    }

    // DELETE /api/profile/avatar
    public function deleteAvatar()
    {
        $user = auth()->user();

        if ($user->avatar && str_starts_with($user->avatar, 'avatars/')) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        UserActivityLog::record($user->id, 'avatar_removed', 'user', $user->id);

        return response()->json(['message' => 'Avatar removed.']);
    }

    // GET /api/profile/activity
    public function activityLog()
    {
        $user = auth()->user();

        $logs = UserActivityLog::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at']);

        return response()->json(['activity' => $logs]);
    }
}