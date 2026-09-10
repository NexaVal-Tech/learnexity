<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * A reusable "generator" is one badge + certificate template pairing
     * (e.g. "Legacy Masterclass") that admins can create repeatedly over
     * time. `badge_fields`/`certificate_fields` are JSON arrays of text
     * overlay definitions — each one a {key,label,text,source,x_pct,y_pct,
     * font,font_size,color,align,max_width_pct,line_height} object.
     * `source` is either "admin" (fixed text the admin types) or
     * "visitor_name" (replaced with whatever the public visitor typed in)
     * — certificates have exactly one visitor_name field, badges have
     * none in the reference design (no name printed on the badge itself).
     */
    public function up(): void
    {
        Schema::create('certificate_badge_generators', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);
            $table->string('badge_template_path')->nullable();
            $table->string('certificate_template_path')->nullable();
            $table->string('certificate_signature_path')->nullable();
            $table->json('badge_fields')->nullable();
            $table->json('certificate_fields')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_badge_generators');
    }
};
