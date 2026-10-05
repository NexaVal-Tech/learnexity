<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-course extras edited in the admin course editor:
 *  - course_instructors: [{ name, role, photo, website, socials: [{ platform, url }] }]
 *  - compare_prices: optional "was" prices shown struck-through next to the
 *    real price, per track and currency:
 *      { self_paced: { usd, ngn }, group_mentorship: {…}, one_on_one: {…}, intermediate: {…} }
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'course_instructors')) {
                $table->json('course_instructors')->nullable();
            }
            if (!Schema::hasColumn('courses', 'compare_prices')) {
                $table->json('compare_prices')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            if (Schema::hasColumn('courses', 'course_instructors')) $table->dropColumn('course_instructors');
            if (Schema::hasColumn('courses', 'compare_prices')) $table->dropColumn('compare_prices');
        });
    }
};
