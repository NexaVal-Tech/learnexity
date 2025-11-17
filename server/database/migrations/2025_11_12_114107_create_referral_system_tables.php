<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Referral codes table
        Schema::create('referral_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('referral_code', 20)->unique();
            $table->integer('total_referrals')->default(0);
            $table->integer('successful_referrals')->default(0);
            $table->integer('pending_referrals')->default(0);
            $table->decimal('total_rewards', 10, 2)->default(0);
            $table->integer('current_streak_months')->default(0);
            $table->timestamp('last_referral_at')->nullable();
            $table->timestamps();
            
            $table->index('referral_code');
        });

        // Referral history table
        Schema::create('referral_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referrer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('referred_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->decimal('reward_amount', 10, 2)->default(30.00);
            $table->timestamp('referred_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['referrer_id', 'status']);
            $table->index('referred_user_id');
        });

        // Add referral_code column to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('referred_by_code', 20)->nullable()->after('role');
            $table->index('referred_by_code');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['referred_by_code']);
            $table->dropColumn('referred_by_code');
        });
        
        Schema::dropIfExists('referral_history');
        Schema::dropIfExists('referral_codes');
    }
};