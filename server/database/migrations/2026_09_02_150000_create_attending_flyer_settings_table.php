<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Singleton settings row (same current()-or-create pattern as
     * RegistrationFeeSetting/ScholarshipSetting) for the standalone
     * "I will be attending" flyer — a one-off feature distinct from the
     * reusable certificate_badge_generators system. A visitor uploads
     * their own photo + types their name; every other piece of text is
     * admin-configured, and the attendee's photo is composited into a
     * defined rectangle between an optional background/foreground
     * template layer pair (foreground carries any artwork — like a photo
     * frame border — that needs to sit visually on top of the photo).
     */
    public function up(): void
    {
        Schema::create('attending_flyer_settings', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique()->default('attending');
            $table->boolean('is_active')->default(true);
            $table->string('page_heading')->default('RSVP — I Will Be Attending');
            $table->string('background_template_path')->nullable();
            $table->string('foreground_template_path')->nullable();
            $table->decimal('photo_x_pct', 5, 2)->default(61.6);
            $table->decimal('photo_y_pct', 5, 2)->default(57.5);
            $table->decimal('photo_width_pct', 5, 2)->default(28.1);
            $table->decimal('photo_height_pct', 5, 2)->default(22.7);
            $table->json('fields')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attending_flyer_settings');
    }
};
