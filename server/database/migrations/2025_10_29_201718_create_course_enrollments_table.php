<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('course_id'); // From courseData.ts (e.g., "ai")
            $table->string('course_name');
            $table->decimal('course_price', 10, 2)->default(0);
            $table->enum('payment_status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('transaction_id')->nullable();
            $table->timestamp('enrollment_date');
            $table->timestamp('payment_date')->nullable();
            $table->timestamps();

            // Prevent duplicate enrollments
            $table->unique(['user_id', 'course_id']);
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_enrollments');
    }
};
