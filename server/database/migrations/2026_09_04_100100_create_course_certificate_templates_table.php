<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single platform-wide certificate design (singleton row) used for
     * every course-completion certificate — auto-issued or manually
     * issued by an admin. `fields` uses the same shape as
     * certificate_badge_generators.certificate_fields
     * ({key,label,text,source,x_pct,y_pct,font,font_size,color,align,
     * max_width_pct,line_height}), except `source` here is 'admin' or one
     * of a fixed set of auto-fill variables resolved at render time:
     * recipient_name, course_title, issue_date, reference_number,
     * signer_name. Positions are TOP-anchored (x_pct/y_pct = top-left of
     * the text box, not center) so the renderer never needs CSS
     * transforms dompdf can't reliably reproduce.
     */
    public function up(): void
    {
        Schema::create('course_certificate_templates', function (Blueprint $table) {
            $table->id();
            $table->string('template_image_path')->nullable();
            $table->decimal('signature_x_pct', 5, 2)->default(61);
            $table->decimal('signature_y_pct', 5, 2)->default(69);
            $table->decimal('signature_width_pct', 5, 2)->default(18);
            $table->json('fields')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_certificate_templates');
    }
};
