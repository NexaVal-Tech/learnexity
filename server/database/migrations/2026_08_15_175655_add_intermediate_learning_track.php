<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds "Intermediate" as a genuine 4th learning track, alongside the
 * existing one_on_one / group_mentorship / self_paced — with its own
 * per-course availability flag and USD/NGN pricing, same pattern as the
 * other three tracks. Also widens course_enrollments.learning_track from a
 * fixed ENUM to a plain string so new track values don't require a DB enum
 * migration every time (validation for allowed values now lives in the app
 * layer, same as everywhere else this value is checked).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->boolean('offers_intermediate')->default(false)->after('offers_self_paced');
            $table->decimal('intermediate_price_usd', 10, 2)->nullable()->after('self_paced_price_ngn');
            $table->decimal('intermediate_price_ngn', 10, 2)->nullable()->after('intermediate_price_usd');
        });

        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->string('learning_track', 50)->default('self_paced')->change();
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['offers_intermediate', 'intermediate_price_usd', 'intermediate_price_ngn']);
        });

        // Not reverting learning_track back to ENUM — narrowing the column
        // back down risks truncating any 'intermediate' rows written since
        // this migration ran.
    }
};
