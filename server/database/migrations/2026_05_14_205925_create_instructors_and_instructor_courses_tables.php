<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('bio')->nullable();
            $table->string('specialisation')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        // Pivot: which courses an instructor can manage
        Schema::create('instructor_courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('instructors')->cascadeOnDelete();
            $table->string('course_id');  // matches courses.course_id (string)
            $table->timestamps();
            $table->unique(['instructor_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_courses');
        Schema::dropIfExists('instructors');
    }
};