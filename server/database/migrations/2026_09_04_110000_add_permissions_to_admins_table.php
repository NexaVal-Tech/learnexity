<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adds sub-admin support: a super admin can create additional Admin
     * accounts with a freeform list of permission keys (see
     * Admin::PERMISSIONS for the canonical list — one per admin section,
     * plus a couple of finer-grained action permissions). Existing admins
     * are grandfathered in as super admins on migrate, since before this
     * migration every admin account had full access anyway.
     */
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->after('email');
            $table->json('permissions')->nullable()->after('is_super_admin');
            $table->foreignId('created_by_admin_id')->nullable()->after('permissions')
                ->constrained('admins')->nullOnDelete();
        });

        DB::table('admins')->update(['is_super_admin' => true]);
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropConstrainedForeignId('created_by_admin_id');
            $table->dropColumn(['is_super_admin', 'permissions']);
        });
    }
};
