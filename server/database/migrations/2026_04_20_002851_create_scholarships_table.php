<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scholarships', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->string('course_id'); // slug
            $table->string('course_name');

            // Use string instead of enum (SQLite compatible)
            $table->string('status')->default('pending'); // pending | approved | rejected

            // Auto-scoring
            $table->integer('score')->default(0);
            $table->integer('location_bonus')->default(0);
            $table->integer('total_score')->default(0);

            // Discount
            $table->integer('discount_percentage')->default(0);

            // JSON (Laravel handles SQLite fallback)
            $table->json('answers');

            // Usage tracking
            $table->boolean('is_used')->default(false);

            $table->foreignId('used_in_enrollment_id')
                ->nullable()
                ->constrained('course_enrollments')
                ->nullOnDelete();

            $table->timestamp('used_at')->nullable();

            // Admin notes
            $table->text('review_notes')->nullable();

            // Location
            $table->string('applicant_country')->nullable();
            $table->string('applicant_ip')->nullable();

            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scholarships');
    }
};