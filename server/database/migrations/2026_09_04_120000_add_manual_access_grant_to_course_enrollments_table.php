<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Lets an admin grant (or revoke) a student's access to a course they're
     * already enrolled in, for any reason, regardless of payment status.
     * `access_manually_granted` is a sticky override flag — see
     * CourseEnrollment::updateAccessStatus()/canAccess(), which both
     * respect it so the normal payment-driven access logic (installment
     * grace periods, etc.) never silently undoes an admin's manual grant.
     */
    public function up(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->boolean('access_manually_granted')->default(false)->after('has_access');
            $table->foreignId('access_granted_by_admin_id')->nullable()->after('access_manually_granted')
                ->constrained('admins')->nullOnDelete();
            $table->timestamp('access_granted_at')->nullable()->after('access_granted_by_admin_id');
        });
    }

    public function down(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('access_granted_by_admin_id');
            $table->dropColumn(['access_manually_granted', 'access_granted_at']);
        });
    }
};
