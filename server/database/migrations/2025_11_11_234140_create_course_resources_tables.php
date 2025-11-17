<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Course Materials Table
        Schema::create('course_materials', function (Blueprint $table) {
            $table->id();
            $table->string('course_id')->index();
            $table->string('sprint_name');
            $table->integer('sprint_number');
            $table->integer('order')->default(0);
            $table->timestamps();
            
            // Foreign key to courses table
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
        });

        // Material Items (PDFs, videos, etc.)
        Schema::create('material_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_material_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->enum('type', ['pdf', 'video', 'document', 'link']);
            $table->string('file_path')->nullable();
            $table->string('file_url')->nullable();
            $table->string('file_size')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Sprint Progress Tracking
        Schema::create('sprint_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('course_id')->index();
            $table->foreignId('course_material_id')->constrained()->onDelete('cascade');
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->integer('completed_items')->default(0);
            $table->integer('total_items')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Foreign key to courses table
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
        });

        // Material Item Progress (individual item completion)
        Schema::create('material_item_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('material_item_id')->constrained()->onDelete('cascade');
            $table->boolean('is_completed')->default(false);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'material_item_id']);
        });

        // User Course Statistics
        Schema::create('user_course_statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('course_id')->index();
            $table->decimal('overall_progress', 5, 2)->default(0);
            $table->integer('total_sprints')->default(0);
            $table->integer('completed_sprints')->default(0);
            $table->integer('time_spent_minutes')->default(0);
            $table->integer('sprints_ahead')->default(0);
            $table->timestamps();
            
            // Foreign key to courses table
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
            $table->unique(['user_id', 'course_id']);
        });

        // Cohort Leaderboard
        Schema::create('cohort_leaderboards', function (Blueprint $table) {
            $table->id();
            $table->string('course_id')->index();
            $table->string('cohort_name');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamps();
            
            // Foreign key to courses table
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
        });

        // Cohort Participants
        Schema::create('cohort_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cohort_leaderboard_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('rank')->default(0);
            $table->decimal('sprint1_score', 5, 2)->default(0);
            $table->decimal('sprint2_score', 5, 2)->default(0);
            $table->decimal('sprint3_score', 5, 2)->default(0);
            $table->decimal('sprint4_score', 5, 2)->default(0);
            $table->decimal('overall_score', 5, 2)->default(0);
            $table->timestamps();
            
            $table->unique(['cohort_leaderboard_id', 'user_id']);
        });

        // External Learning Resources
        Schema::create('external_resources', function (Blueprint $table) {
            $table->id();
            $table->string('course_id')->index();
            $table->enum('category', ['video_tutorials', 'industry_articles', 'recommended_reading']);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('url');
            $table->string('source');
            $table->string('duration')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
            
            // Foreign key to courses table
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
        });

        // Achievement Badges
        Schema::create('achievement_badges', function (Blueprint $table) {
            $table->id();
            $table->string('course_id')->index();
            $table->string('name');
            $table->text('description');
            $table->string('badge_icon')->nullable();
            $table->string('badge_color')->default('#9333EA');
            $table->enum('unlock_type', ['sprint_completion', 'course_completion', 'milestone']);
            $table->integer('unlock_value')->default(1);
            $table->timestamps();
            
            // Foreign key to courses table
            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
        });

        // User Badges (unlocked achievements)
        Schema::create('user_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('achievement_badge_id')->constrained()->onDelete('cascade');
            $table->timestamp('unlocked_at');
            $table->timestamps();
            
            $table->unique(['user_id', 'achievement_badge_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_badges');
        Schema::dropIfExists('achievement_badges');
        Schema::dropIfExists('external_resources');
        Schema::dropIfExists('cohort_participants');
        Schema::dropIfExists('cohort_leaderboards');
        Schema::dropIfExists('user_course_statistics');
        Schema::dropIfExists('material_item_progress');
        Schema::dropIfExists('sprint_progress');
        Schema::dropIfExists('material_items');
        Schema::dropIfExists('course_materials');
    }
};