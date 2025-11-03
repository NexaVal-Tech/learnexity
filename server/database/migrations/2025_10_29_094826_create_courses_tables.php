<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('course_id')->unique(); // The 'id' from your data (e.g., 'ai')
            $table->string('title');
            $table->text('project')->nullable();
            $table->text('description');
            $table->string('hero_image')->nullable();
            $table->string('secondary_image')->nullable();
            $table->string('duration')->nullable();
            $table->string('level')->nullable();
            
            // Pricing columns
            $table->decimal('price', 10, 2)->default(0); // Course price
            $table->boolean('is_freemium')->default(false); // Free trial/freemium model
            $table->boolean('is_premium')->default(false); // Premium/paid course
            
            $table->timestamps();
        });

        Schema::create('course_tools', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('icon')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('course_learnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->text('learning_point');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('course_benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('text');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('course_career_paths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->enum('level', ['entry', 'mid', 'advanced', 'specialized']);
            $table->string('position');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('course_industries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('text');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        Schema::create('course_salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->string('entry_level')->nullable();
            $table->string('mid_level')->nullable();
            $table->string('senior_level')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_salaries');
        Schema::dropIfExists('course_industries');
        Schema::dropIfExists('course_career_paths');
        Schema::dropIfExists('course_benefits');
        Schema::dropIfExists('course_learnings');
        Schema::dropIfExists('course_tools');
        Schema::dropIfExists('courses');
    }
};