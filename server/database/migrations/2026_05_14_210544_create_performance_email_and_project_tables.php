<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Track per-user per-course performance scores
        Schema::create('user_performance_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('course_id');
            // 4 dimensions, 0–100 each
            $table->decimal('speed_score', 5, 2)->default(0);
            $table->decimal('quality_score', 5, 2)->default(0);
            $table->decimal('reliability_score', 5, 2)->default(0);
            $table->decimal('problem_solving_score', 5, 2)->default(0);
            $table->decimal('overall_score', 5, 2)->default(0);
            // Raw signals used for scoring
            $table->integer('sprints_completed')->default(0);
            $table->integer('total_sprints')->default(0);
            $table->integer('login_streak_days')->default(0);
            $table->integer('total_logins')->default(0);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamp('last_sprint_completed_at')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'course_id']);
        });

        // Log every email we send so we don't spam
        Schema::create('email_sequence_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('email_type');   // e.g. sprint_complete, daily_checkin, slow_progress
            $table->string('course_id')->nullable();
            $table->json('metadata')->nullable();   // sprint number, score, etc.
            $table->timestamp('sent_at');
            $table->index(['user_id', 'email_type', 'sent_at']);
        });

        // Projects / assignments workflow
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('course_id');
            $table->foreignId('sprint_id')->nullable()->constrained('course_materials')->nullOnDelete();
            $table->foreignId('created_by_instructor')->nullable()->constrained('instructors')->nullOnDelete();
            $table->string('title');
            $table->text('brief');                      // Project Brief
            $table->text('expected_outcome')->nullable();
            $table->date('deadline')->nullable();
            $table->enum('phase', [
                'brief',        // Phase 1
                'team',         // Phase 2
                'execution',    // Phase 3
                'review',       // Phase 4
                'delivery',     // Phase 5
            ])->default('brief');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('project_team_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role');   // designer, builder, analyst, etc.
            $table->timestamps();
            $table->unique(['project_id', 'user_id']);
        });

        Schema::create('project_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('phase');
            $table->text('content')->nullable();        // text submission
            $table->string('file_path')->nullable();    // uploaded file
            $table->string('file_name')->nullable();
            $table->enum('status', ['submitted', 'reviewed', 'revision_requested', 'approved'])->default('submitted');
            $table->text('instructor_feedback')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('instructors')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('project_checkins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('update');                     // what they worked on
            $table->text('blocker')->nullable();        // any blockers
            $table->date('checkin_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_checkins');
        Schema::dropIfExists('project_submissions');
        Schema::dropIfExists('project_team_roles');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('email_sequence_logs');
        Schema::dropIfExists('user_performance_scores');
    }
};