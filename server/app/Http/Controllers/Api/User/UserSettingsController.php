<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\UserActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class UserSettingsController extends Controller
{
    // GET /api/settings
    public function show()
    {
        $user = auth()->user();

        return response()->json([
            'settings' => [
                'email_notifications'  => (bool) ($user->email_notifications  ?? true),
                'marketing_emails'     => (bool) ($user->marketing_emails     ?? false),
                'sms_notifications'    => (bool) ($user->sms_notifications    ?? false),
                'profile_public'       => (bool) ($user->profile_public       ?? false),
                'two_factor_enabled'   => (bool) ($user->two_factor_enabled   ?? false),
                'has_password'         => !is_null($user->password),
                'google_connected'     => !is_null($user->google_id),
            ],
        ]);
    }

    // PUT /api/settings/notifications
    public function updateNotifications(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'email_notifications' => 'boolean',
            'marketing_emails'    => 'boolean',
            'sms_notifications'   => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($request->only([
            'email_notifications',
            'marketing_emails',
            'sms_notifications',
        ]));

        UserActivityLog::record($user->id, 'notification_settings_updated', 'user', $user->id, [
            'changes' => $request->only(['email_notifications', 'marketing_emails', 'sms_notifications']),
        ]);

        return response()->json(['message' => 'Notification preferences saved.']);
    }

    // PUT /api/settings/privacy
    public function updatePrivacy(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'profile_public' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update(['profile_public' => $request->profile_public]);

        UserActivityLog::record($user->id, 'privacy_settings_updated', 'user', $user->id, [
            'profile_public' => $request->profile_public,
        ]);

        return response()->json(['message' => 'Privacy settings saved.']);
    }

    // PUT /api/settings/password
    public function changePassword(Request $request)
    {
        $user = auth()->user();

        $rules = [
            'new_password'              => 'required|min:8|confirmed',
            'new_password_confirmation' => 'required',
        ];

        // Only require current password if user has one (not Google-only accounts)
        if ($user->password) {
            $rules['current_password'] = 'required|string';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($user->password && !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['Current password is incorrect.']]
            ], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        UserActivityLog::record($user->id, 'password_changed', 'user', $user->id);

        return response()->json(['message' => 'Password changed successfully.']);
    }

    // DELETE /api/settings/account
    public function deleteAccount(Request $request)
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'confirmation' => 'required|in:DELETE',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => ['confirmation' => ['Please type DELETE to confirm.']]
            ], 422);
        }

        // Verify password if account has one
        if ($user->password) {
            $validator2 = Validator::make($request->all(), [
                'password' => 'required|string',
            ]);
            if ($validator2->fails() || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'errors' => ['password' => ['Password is incorrect.']]
                ], 422);
            }
        }

        UserActivityLog::record($user->id, 'account_deleted', 'user', $user->id, [
            'email' => $user->email,
            'name'  => $user->name,
        ]);

        Log::warning('🗑️ Account deleted', [
            'user_id' => $user->id,
            'email'   => $user->email,
        ]);

        $user->delete();

        return response()->json(['message' => 'Account deleted successfully.']);
    }
}