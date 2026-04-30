<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds starter_group pricing columns to kids_courses.
 *
 * Run: php artisan migrate
 * Then: php artisan db:seed --class=KidsCoursesSeeder
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kids_courses', function (Blueprint $table) {
            // Standalone starter-group prices (per-month × duration)
            $table->decimal('starter_group_price_usd', 10, 2)->default(0)->after('group_price_usd');
            $table->decimal('starter_group_price_ngn', 12, 2)->default(0)->after('group_price_ngn');

            // Bundle starter-group prices (DF month + track months combined)
            $table->decimal('bundle_starter_group_usd', 10, 2)->default(0)->after('bundle_group_usd');
            $table->decimal('bundle_starter_group_ngn', 12, 2)->default(0)->after('bundle_group_ngn');
        });
    }

    public function down(): void
    {
        Schema::table('kids_courses', function (Blueprint $table) {
            $table->dropColumn([
                'starter_group_price_usd',
                'starter_group_price_ngn',
                'bundle_starter_group_usd',
                'bundle_starter_group_ngn',
            ]);
        });
    }
};