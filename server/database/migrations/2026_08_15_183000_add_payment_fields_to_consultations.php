<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Fixes a pre-existing gap: ConsultationPaymentController and
// ConsultationPaymentService::markPaid() already write 'amount', 'currency',
// 'transaction_id' and 'payment_method' to the Consultation model, but none
// of these columns existed on the table (and none were in $fillable), so
// those writes were silently dropped by Eloquent's mass-assignment guard.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            if (!Schema::hasColumn('consultations', 'amount')) {
                $table->decimal('amount', 10, 2)->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('consultations', 'currency')) {
                $table->string('currency', 3)->nullable()->after('amount');
            }
            if (!Schema::hasColumn('consultations', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->after('currency');
            }
            if (!Schema::hasColumn('consultations', 'payment_method')) {
                $table->string('payment_method')->nullable()->after('transaction_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropColumn(['amount', 'currency', 'transaction_id', 'payment_method']);
        });
    }
};
