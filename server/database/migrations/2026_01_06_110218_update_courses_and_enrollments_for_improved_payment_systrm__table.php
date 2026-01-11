<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Update courses table
        Schema::table('courses', function (Blueprint $table) {
            // Pricing fields
            $table->decimal('price_usd', 10, 2)->default(0)->after('price');
            $table->decimal('price_ngn', 10, 2)->default(0)->after('price_usd');
            
            // Track-specific pricing (USD)
            $table->decimal('one_on_one_price_usd', 10, 2)->nullable()->after('one_on_one_price');
            $table->decimal('group_mentorship_price_usd', 10, 2)->nullable()->after('group_mentorship_price');
            $table->decimal('self_paced_price_usd', 10, 2)->nullable()->after('self_paced_price');
            
            // Track-specific pricing (NGN)
            $table->decimal('one_on_one_price_ngn', 10, 2)->nullable()->after('one_on_one_price_usd');
            $table->decimal('group_mentorship_price_ngn', 10, 2)->nullable()->after('group_mentorship_price_usd');
            $table->decimal('self_paced_price_ngn', 10, 2)->nullable()->after('self_paced_price_usd');
            
            // One-time payment discount pricing
            $table->decimal('onetime_discount_usd', 10, 2)->nullable()->after('self_paced_price_ngn');
            $table->decimal('onetime_discount_ngn', 10, 2)->nullable()->after('onetime_discount_usd');
        });

        // Update course_enrollments table
        Schema::table('course_enrollments', function (Blueprint $table) {
            // Payment type: 'onetime' or 'installment'
            $table->enum('payment_type', ['onetime', 'installment'])->default('onetime')->after('learning_track');
            
            // Currency used
            $table->string('currency', 3)->default('USD')->after('payment_type'); // USD or NGN
            
            // Total amount to be paid
            $table->decimal('total_amount', 10, 2)->default(0)->after('currency');
            
            // Amount paid so far
            $table->decimal('amount_paid', 10, 2)->default(0)->after('total_amount');
            
            // Installment tracking
            $table->integer('total_installments')->default(1)->after('amount_paid'); // 1 for onetime, 4 for installment
            $table->integer('installments_paid')->default(0)->after('total_installments');
            $table->decimal('installment_amount', 10, 2)->default(0)->after('installments_paid');
            
            // Next payment due date
            $table->timestamp('next_payment_due')->nullable()->after('payment_date');
            
            // Access status - determines if user can access course materials
            $table->boolean('has_access')->default(false)->after('next_payment_due');
            
            // Last payment date for installments
            $table->timestamp('last_installment_paid_at')->nullable()->after('has_access');
        });

        // Create installment_payments table to track individual payments
        Schema::create('installment_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('course_enrollments')->onDelete('cascade');
            $table->integer('installment_number'); // 1, 2, 3, or 4
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3); // USD or NGN
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->string('transaction_id')->nullable();
            $table->timestamp('due_date')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            
            $table->index(['enrollment_id', 'installment_number']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installment_payments');
        
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropColumn([
                'payment_type',
                'currency',
                'total_amount',
                'amount_paid',
                'total_installments',
                'installments_paid',
                'installment_amount',
                'next_payment_due',
                'has_access',
                'last_installment_paid_at'
            ]);
        });
        
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'price_usd',
                'price_ngn',
                'one_on_one_price_usd',
                'group_mentorship_price_usd',
                'self_paced_price_usd',
                'one_on_one_price_ngn',
                'group_mentorship_price_ngn',
                'self_paced_price_ngn',
                'onetime_discount_usd',
                'onetime_discount_ngn'
            ]);
        });
    }
};