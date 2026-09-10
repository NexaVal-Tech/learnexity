<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * `approved_at` is the explicit "award" timestamp driving the cosmetic
     * 30-day countdown (rather than relying on created_at, which happens
     * to be the same moment today but isn't guaranteed to stay that way).
     * `reminders_sent` tracks which day-thresholds (14, 7, 6, 5, 4, 3, 2, 1)
     * have already been emailed for a given scholarship, so the daily
     * reminder command never double-sends.
     */
    public function up(): void
    {
        Schema::table('scholarships', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('status');
            $table->json('reminders_sent')->nullable()->after('approved_at');
        });

        // Every existing scholarship was auto-approved at creation time
        // (see ScholarshipController::apply()/autoDecide()) — backfill
        // approved_at from created_at for any row already in that state.
        DB::table('scholarships')
            ->where('status', 'approved')
            ->whereNull('approved_at')
            ->update(['approved_at' => DB::raw('created_at')]);
    }

    public function down(): void
    {
        Schema::table('scholarships', function (Blueprint $table) {
            $table->dropColumn(['approved_at', 'reminders_sent']);
        });
    }
};
