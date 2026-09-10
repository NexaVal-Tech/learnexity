<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * Super-admin-only management of other admin accounts ("Team"). Every
 * method here must be reached only by a super admin — enforced by the
 * 'admin.super' middleware on these routes (routes/api.php), not by
 * checking $request->user()->is_super_admin in each method, so a
 * permission mistake here can't be worked around by a limited admin
 * hitting the endpoint directly. Creating/editing another admin's
 * `is_super_admin` flag is deliberately NOT exposed through the freeform
 * `permissions` checkbox list — only an existing super admin can grant it,
 * via the dedicated `is_super_admin` field on this controller, preventing
 * a limited admin from ever escalating themselves or anyone else.
 */
class AdminManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $admins = Admin::query()
            ->select(['id', 'name', 'email', 'is_super_admin', 'permissions', 'created_by_admin_id', 'created_at'])
            ->orderBy('created_at')
            ->get();

        return response()->json(['admins' => $admins, 'available_permissions' => Admin::PERMISSIONS]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|unique:admins,email',
            'password'        => 'required|string|min:8',
            'is_super_admin'  => 'sometimes|boolean',
            'permissions'     => 'sometimes|array',
            'permissions.*'   => [Rule::in(array_keys(Admin::PERMISSIONS))],
        ]);

        $admin = Admin::create([
            'name'                => $validated['name'],
            'email'               => $validated['email'],
            'password'            => Hash::make($validated['password']),
            'is_super_admin'      => $validated['is_super_admin'] ?? false,
            'permissions'         => $validated['permissions'] ?? [],
            'created_by_admin_id' => $request->user('admin')?->id,
        ]);

        \App\Services\ActivityLogger::log(
            'admin.created',
            "{$request->user('admin')?->name} created admin account for {$admin->name}",
            actorType: 'admin',
            actorId: $request->user('admin')?->id,
            metadata: ['new_admin_id' => $admin->id]
        );

        return response()->json(['message' => 'Admin account created', 'admin' => $admin], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $admin = Admin::findOrFail($id);

        $validated = $request->validate([
            'name'            => 'sometimes|required|string|max:255',
            'email'           => ['sometimes', 'required', 'email', Rule::unique('admins', 'email')->ignore($admin->id)],
            'password'        => 'sometimes|nullable|string|min:8',
            'is_super_admin'  => 'sometimes|boolean',
            'permissions'     => 'sometimes|array',
            'permissions.*'   => [Rule::in(array_keys(Admin::PERMISSIONS))],
        ]);

        if (isset($validated['name'])) $admin->name = $validated['name'];
        if (isset($validated['email'])) $admin->email = $validated['email'];
        if (!empty($validated['password'])) $admin->password = Hash::make($validated['password']);
        if (array_key_exists('is_super_admin', $validated)) $admin->is_super_admin = $validated['is_super_admin'];
        if (array_key_exists('permissions', $validated)) $admin->permissions = $validated['permissions'];

        // A super admin can never demote/lock themselves out by accident
        // via this endpoint if they're the only super admin left.
        if (
            $admin->id === $request->user('admin')?->id
            && $admin->isDirty('is_super_admin')
            && ! $admin->is_super_admin
            && Admin::where('is_super_admin', true)->count() <= 1
        ) {
            return response()->json(['message' => 'You are the only super admin — promote someone else first.'], 422);
        }

        $admin->save();

        return response()->json(['message' => 'Admin account updated', 'admin' => $admin]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $admin = Admin::findOrFail($id);

        if ($admin->id === $request->user('admin')?->id) {
            return response()->json(['message' => "You can't delete your own account."], 422);
        }
        if ($admin->is_super_admin && Admin::where('is_super_admin', true)->count() <= 1) {
            return response()->json(['message' => 'At least one super admin must remain.'], 422);
        }

        $admin->delete();

        return response()->json(['message' => 'Admin account deleted']);
    }
}
