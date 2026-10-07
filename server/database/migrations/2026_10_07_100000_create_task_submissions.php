<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sprint tasks:
 *  - material_items.task_config — the requirements an admin/instructor sets on
 *    a material item that turns it into a task students must respond to.
 *  - material_item_submissions — one row per attempt (written answer, link
 *    and/or file), with the automatic mark and any manual grade.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('material_items', function (Blueprint $table) {
            if (!Schema::hasColumn('material_items', 'task_config')) {
                $table->json('task_config')->nullable();
            }
        });

        if (!Schema::hasTable('material_item_submissions')) {
            Schema::create('material_item_submissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('material_item_id')->constrained('material_items')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('course_id', 100)->index();
                $table->unsignedInteger('attempt')->default(1);

                $table->text('text_response')->nullable();
                $table->string('link_url', 2048)->nullable();
                $table->string('file_path', 500)->nullable();
                $table->string('file_original_name', 255)->nullable();
                $table->string('file_ext', 10)->nullable();
                $table->unsignedBigInteger('file_size')->nullable();

                $table->decimal('auto_score', 5, 2)->nullable();
                $table->json('auto_checks')->nullable();
                $table->decimal('score', 5, 2)->nullable();
                // submitted | passed | needs_revision | graded
                $table->string('status', 30)->default('submitted')->index();
                $table->text('feedback')->nullable();
                $table->string('graded_by_type', 20)->nullable(); // auto | admin | instructor
                $table->unsignedBigInteger('graded_by_id')->nullable();
                $table->string('graded_by_name', 150)->nullable();
                $table->timestamp('graded_at')->nullable();

                $table->string('ip_address', 45)->nullable();
                $table->timestamps();

                $table->index(['material_item_id', 'user_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('material_item_submissions');
        Schema::table('material_items', function (Blueprint $table) {
            if (Schema::hasColumn('material_items', 'task_config')) $table->dropColumn('task_config');
        });
    }
};
