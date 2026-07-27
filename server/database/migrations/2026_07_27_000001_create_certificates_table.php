<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();
            $table->uuid('certificate_uid')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('course_id')->index();
            $table->string('course_title');
            $table->string('recipient_name');
            $table->enum('issue_type', ['auto', 'manual'])->default('auto');
            $table->foreignId('issued_by_admin_id')->nullable()
                ->constrained('admins')->nullOnDelete();
            $table->string('pdf_path')->nullable();
            $table->timestamp('issued_at');
            $table->timestamp('revoked_at')->nullable();
            $table->string('revoked_reason')->nullable();
            $table->timestamps();

            $table->foreign('course_id')->references('course_id')->on('courses')->onDelete('cascade');
            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
