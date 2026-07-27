<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event_type')->index();       // e.g. 'user.login', 'enrollment.created'
            $table->string('actor_type')->default('user'); // 'user' | 'admin' | 'instructor' | 'system'
            $table->unsignedBigInteger('actor_id')->nullable()->index();
            $table->string('actor_name')->nullable();
            $table->text('description');
            $table->string('course_id')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->nullable()->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
