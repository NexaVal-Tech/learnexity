<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-only course grouping — e.g. "Data Analysis" as a group containing
 * several related courses. One group can contain many courses; a course can
 * also stand alone with no group at all (course_group_id nullable). This is
 * purely an organizational/admin feature for now — there's no user-facing
 * display of groups yet.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->foreignId('course_group_id')
                ->nullable()
                ->after('id')
                ->constrained('course_groups')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('course_group_id');
        });

        Schema::dropIfExists('course_groups');
    }
};
