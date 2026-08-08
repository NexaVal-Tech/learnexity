<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the admin-configurable "partial scholarship" percentage — the award
 * given to any applicant who doesn't qualify for the full-tuition (100%)
 * tier. There is no more 0%/rejected outcome: every applicant now gets at
 * least this percentage off. Defaults to 50 (50%) but is editable from the
 * admin Course Settings page (see RegistrationFeeSettings.tsx).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registration_fee_settings', function (Blueprint $table) {
            $table->decimal('partial_scholarship_percentage', 5, 2)->default(50)->after('flexible_price_ngn');
        });
    }

    public function down(): void
    {
        Schema::table('registration_fee_settings', function (Blueprint $table) {
            $table->dropColumn('partial_scholarship_percentage');
        });
    }
};
