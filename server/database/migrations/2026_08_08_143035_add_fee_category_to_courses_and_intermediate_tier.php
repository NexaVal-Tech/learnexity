<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Add intermediate_price_usd if it doesn't already exist.
         */
        if (!Schema::hasColumn('registration_fee_settings', 'intermediate_price_usd')) {
            Schema::table('registration_fee_settings', function (Blueprint $table) {
                $table->decimal('intermediate_price_usd', 10, 2)
                    ->default(0)
                    ->after('partial_scholarship_percentage');
            });
        }

        /*
         * Add intermediate_price_ngn if it doesn't already exist.
         */
        if (!Schema::hasColumn('registration_fee_settings', 'intermediate_price_ngn')) {
            Schema::table('registration_fee_settings', function (Blueprint $table) {
                $table->decimal('intermediate_price_ngn', 10, 2)
                    ->default(0)
                    ->after('intermediate_price_usd');
            });
        }

        /*
         * Add fee_category to courses if it doesn't already exist.
         */
        if (!Schema::hasColumn('courses', 'fee_category')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->string('fee_category')
                    ->nullable()
                    ->after('course_group_id');
            });
        }

        /*
         * Backfill the intermediate tier using the existing
         * flexible tier prices.
         */
        DB::table('registration_fee_settings')->update([
            'intermediate_price_usd' => DB::raw('flexible_price_usd'),
            'intermediate_price_ngn' => DB::raw('flexible_price_ngn'),
        ]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('courses', 'fee_category')) {
            Schema::table('courses', function (Blueprint $table) {
                $table->dropColumn('fee_category');
            });
        }

        if (Schema::hasColumn('registration_fee_settings', 'intermediate_price_usd')) {
            Schema::table('registration_fee_settings', function (Blueprint $table) {
                $table->dropColumn('intermediate_price_usd');
            });
        }

        if (Schema::hasColumn('registration_fee_settings', 'intermediate_price_ngn')) {
            Schema::table('registration_fee_settings', function (Blueprint $table) {
                $table->dropColumn('intermediate_price_ngn');
            });
        }
    }
};