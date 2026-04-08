<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('public_referrers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('referral_code', 12)->unique();
            $table->unsignedInteger('total_referrals')->default(0);
            $table->unsignedInteger('successful_referrals')->default(0);
            $table->unsignedInteger('pending_referrals')->default(0);
            $table->decimal('total_earnings', 10, 2)->default(0);
            $table->timestamps();
        });

        Schema::table('referral_history', function (Blueprint $table) {
            $table->foreignId('public_referrer_id')
                ->nullable()
                ->after('referrer_id')
                ->constrained('public_referrers')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('referral_histories', function (Blueprint $table) {
            $table->dropForeign(['public_referrer_id']);
            $table->dropColumn('public_referrer_id');
        });

        Schema::dropIfExists('public_referrers');
    }
};
