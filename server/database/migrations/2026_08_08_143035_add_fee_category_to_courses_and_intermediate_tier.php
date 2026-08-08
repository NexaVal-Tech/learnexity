<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Adds a new "Intermediate" registration-fee category alongside the
 * existing Deep-Tech / Flexible tiers, and an admin-settable fee_category
 * column on courses so a course can be explicitly moved into a category —
 * overriding the automatic track-based derivation in
 * RegistrationFeeSetting::categoryForTrack(). Null (the default) keeps the
 * existing automatic behaviour; admin-only for now, no user-facing display.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registration_fee_settings', function (Blueprint $table) {
            $table->decimal('intermediate_price_usd', 10, 2)->default(0)->after('partial_scholarship_percentage');
            $table->decimal('intermediate_price_ngn', 10, 2)->default(0)->after('intermediate_price_usd');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->string('fee_category')->nullable()->after('course_group_id');
        });

        // Backfill: default the new tier to the flexible price so nothing
        // silently prices at 0 the moment this migration runs, same
        // approach as the earlier deeptech/flexible split.
        DB::table('registration_fee_settings')->update([
            'intermediate_price_usd' => DB::raw('flexible_price_usd'),
            'intermediate_price_ngn' => DB::raw('flexible_price_ngn'),
        ]);
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('fee_category');
        });

        Schema::table('registration_fee_settings', function (Blueprint $table) {
            $table->dropColumn(['intermediate_price_usd', 'intermediate_price_ngn']);
        });
    }
};
