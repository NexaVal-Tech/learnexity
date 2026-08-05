<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Deep-tech tracks (one_on_one / group_mentorship) now collect a short
// self-attestation screening (laptop, programming foundation, reliable
// internet) before enrollment. This is a SOFT gate — applicants who don't
// meet the criteria are still enrolled, just flagged here so admins know
// to follow up with them (e.g. via WhatsApp) rather than being silently
// blocked. See CourseEnrollmentController::enroll().
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->boolean('deep_tech_screening_passed')->nullable()->after('learning_track');
            $table->json('deep_tech_screening_answers')->nullable()->after('deep_tech_screening_passed');
        });
    }

    public function down(): void
    {
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropColumn(['deep_tech_screening_passed', 'deep_tech_screening_answers']);
        });
    }
};
