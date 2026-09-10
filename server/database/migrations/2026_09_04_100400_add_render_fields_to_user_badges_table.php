<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * user_badges is the per-unlock record (mirrors how `certificates` is
     * the per-issuance record) — this is where the rendered badge
     * artifact's own reference number and file path live, one per unlock.
     * pdf_path is nullable/backfilled lazily: existing unlocks render on
     * next download request rather than needing a bulk backfill job.
     */
    public function up(): void
    {
        Schema::table('user_badges', function (Blueprint $table) {
            $table->string('reference_number')->nullable()->unique()->after('achievement_badge_id');
            $table->string('pdf_path')->nullable()->after('reference_number');
            $table->timestamp('rendered_at')->nullable()->after('pdf_path');
        });
    }

    public function down(): void
    {
        Schema::table('user_badges', function (Blueprint $table) {
            $table->dropColumn(['reference_number', 'pdf_path', 'rendered_at']);
        });
    }
};
