<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Splits the single platform-wide registration fee into two tiers:
 *  - "deeptech" — courses taken via the one_on_one or group_mentorship
 *    tracks (see CourseController::byTrack / the Courses.tsx "Deep-Tech"
 *    section).
 *  - "flexible" — courses taken via the self_paced track (the "Flexible"
 *    section).
 *
 * A course itself isn't exclusively one or the other (it can offer more
 * than one track), so the tier is decided per-enrollment by which
 * learning_track was actually chosen — see PricingService::calculate().
 *
 * The old flat price_usd/price_ngn columns are kept (read-only from here
 * on) purely so this migration is non-destructive; the new columns are
 * backfilled from them so nothing silently resets to 0 for existing
 * deployments that already configured a fee.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registration_fee_settings', function (Blueprint $table) {
            $table->decimal('deeptech_price_usd', 10, 2)->default(0)->after('price_ngn');
            $table->decimal('deeptech_price_ngn', 10, 2)->default(0)->after('deeptech_price_usd');
            $table->decimal('flexible_price_usd', 10, 2)->default(0)->after('deeptech_price_ngn');
            $table->decimal('flexible_price_ngn', 10, 2)->default(0)->after('flexible_price_usd');
        });

        // Backfill: whatever the single flat fee was, use it as the initial
        // value for BOTH tiers so pricing doesn't silently change to 0 the
        // moment this migration runs. The admin can then differentiate them
        // from the settings page.
        DB::table('registration_fee_settings')->update([
            'deeptech_price_usd' => DB::raw('price_usd'),
            'deeptech_price_ngn' => DB::raw('price_ngn'),
            'flexible_price_usd' => DB::raw('price_usd'),
            'flexible_price_ngn' => DB::raw('price_ngn'),
        ]);
    }

    public function down(): void
    {
        Schema::table('registration_fee_settings', function (Blueprint $table) {
            $table->dropColumn([
                'deeptech_price_usd', 'deeptech_price_ngn',
                'flexible_price_usd', 'flexible_price_ngn',
            ]);
        });
    }
};
