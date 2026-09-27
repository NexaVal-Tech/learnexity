<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_requests', function (Blueprint $table) {
            $table->id();

            // Who's asking to be paid — a student (users table) or a public
            // referrer (public_referrers table). Kept as an explicit type +
            // id pair (rather than a single FK) since the two live in
            // separate tables/guards.
            $table->enum('payee_type', ['user', 'public_referrer']);
            $table->unsignedBigInteger('payee_id');

            $table->decimal('amount', 10, 2);

            // Snapshot of the bank details at request time, independent of
            // whatever the referrer's saved details say later.
            $table->string('bank_name', 100);
            $table->string('account_number', 20);
            $table->string('account_name', 150);

            $table->enum('status', ['pending', 'approved', 'declined'])->default('pending');
            $table->text('admin_note')->nullable();

            $table->foreignId('processed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();

            $table->timestamps();

            $table->index(['payee_type', 'payee_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_requests');
    }
};
