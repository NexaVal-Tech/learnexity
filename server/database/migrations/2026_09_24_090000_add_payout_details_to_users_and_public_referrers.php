<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Refer & Earn payout support — see also
// 2026_09_24_090100_create_payout_requests_table.php.
//
// Bank details are saved on the referrer's own record (User for students,
// PublicReferrer for public referrers) so they don't have to re-enter them
// on every payout request; each payout_requests row still snapshots the
// values used at request time in case the referrer edits their saved
// details later.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('payout_bank_name', 100)->nullable()->after('referred_by_code');
            $table->string('payout_account_number', 20)->nullable()->after('payout_bank_name');
            $table->string('payout_account_name', 150)->nullable()->after('payout_account_number');
        });

        Schema::table('public_referrers', function (Blueprint $table) {
            $table->string('payout_bank_name', 100)->nullable()->after('total_earnings');
            $table->string('payout_account_number', 20)->nullable()->after('payout_bank_name');
            $table->string('payout_account_name', 150)->nullable()->after('payout_account_number');
        });

        // Reward amount used to be set to a flat placeholder (₦30 / ₦5,000)
        // at signup time. It's now computed as 10% of the referred person's
        // first course payment, so it should start at 0 and stay 0 until a
        // real payment happens — not default to a stale flat figure.
        Schema::table('referral_history', function (Blueprint $table) {
            $table->decimal('reward_amount', 10, 2)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['payout_bank_name', 'payout_account_number', 'payout_account_name']);
        });

        Schema::table('public_referrers', function (Blueprint $table) {
            $table->dropColumn(['payout_bank_name', 'payout_account_number', 'payout_account_name']);
        });

        Schema::table('referral_history', function (Blueprint $table) {
            $table->decimal('reward_amount', 10, 2)->default(30.00)->change();
        });
    }
};
