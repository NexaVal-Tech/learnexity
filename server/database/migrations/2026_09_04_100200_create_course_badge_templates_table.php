<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single platform-wide badge design (singleton row) used for every
     * sprint-completion / course-completion badge unlock. Same field
     * shape as course_certificate_templates.fields; `source` here is
     * 'admin' or one of: recipient_name, badge_name, badge_description,
     * course_title, issue_date, reference_number. Positions are
     * TOP-anchored (see course_certificate_templates comment).
     */
    public function up(): void
    {
        Schema::create('course_badge_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_image_path')->nullable();
            $table->json('fields')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_badge_templates');
    }
};
