<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Distinguishes which site a consultation booking came from. 'learnexity'
// (the default) is the existing course-consultation flow on the main site;
// 'advisory' is the new, always-free "Technology Value Assessment" booking
// from advisory.learnexity.org (see ConsultationPaymentController::initiate()).
// A plain string column (not a DB enum) to match how consultation_type and
// payment_status/status are already handled elsewhere in this table.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            if (!Schema::hasColumn('consultations', 'source')) {
                $table->string('source')->default('learnexity')->after('consultation_type');
                $table->index('source');
            }
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropIndex(['source']);
            $table->dropColumn('source');
        });
    }
};
