<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('consultation_type'); // course_guidance, career_advice, technical_support, renewal, general
            $table->string('course')->nullable();
            $table->text('message')->nullable();
            $table->date('preferred_date');
            $table->string('preferred_time'); // e.g. "10:00 AM"
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->enum('payment_status', ['free', 'paid', 'pending'])->default('free');
            $table->text('notes')->nullable(); // admin notes
            $table->timestamps();

            $table->index(['preferred_date', 'preferred_time']);
            $table->index('status');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};