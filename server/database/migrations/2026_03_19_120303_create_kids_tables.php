<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Kids Courses ──────────────────────────────────────────────────────
        Schema::create('kids_courses', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('emoji', 10)->default('📚');
            $table->string('color', 20)->default('#4A3AFF');

            // DF = 1 month, specialisation tracks = 2 months
            $table->integer('duration_months')->default(1);

            // Marks this as the foundation prerequisite course
            $table->boolean('is_foundation')->default(false);

            // ── Standalone pricing (course on its own) ────────────────────────
            $table->decimal('one_on_one_price_usd', 10, 2)->default(0);
            $table->decimal('group_price_usd', 10, 2)->default(0);
            $table->decimal('one_on_one_price_ngn', 12, 2)->default(0);
            $table->decimal('group_price_ngn', 12, 2)->default(0);

            // ── Bundle pricing (DF + this track, total for both months) ───────
            // Only relevant on specialisation track rows.
            // Represents the combined price of DF (1 month) + track (2 months).
            $table->decimal('bundle_one_on_one_usd', 10, 2)->default(0);
            $table->decimal('bundle_group_usd', 10, 2)->default(0);
            $table->decimal('bundle_one_on_one_ngn', 12, 2)->default(0);
            $table->decimal('bundle_group_ngn', 12, 2)->default(0);

            // ── One-time payment discount (%) ─────────────────────────────────
            // Discount rewarded when paying the full amount at once.
            // Installment plan = full price with NO discount.
            $table->decimal('onetime_discount_percent', 5, 2)->default(0);

            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // ── Kids Enrollments ──────────────────────────────────────────────────
        Schema::create('kids_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kids_course_id')->constrained()->cascadeOnDelete();

            // ── Parent & child info ───────────────────────────────────────────
            $table->string('parent_name');
            $table->string('parent_email');
            $table->string('parent_phone')->nullable();
            $table->string('student_name');
            $table->integer('student_age');

            // enrollment_type:
            //   'bundle'           → DF (1 month) + specialisation track (2 months) together
            //   'track_only'       → specialisation track only, skipped DF
            //   'foundation_only'  → Digital Foundations only
            $table->enum('enrollment_type', ['bundle', 'track_only', 'foundation_only'])->default('bundle');

            // Links the two enrollments in a bundle (DF row ↔ track row share this)
            $table->unsignedBigInteger('paired_enrollment_id')->nullable();

            // 'one_on_one' | 'group_mentorship'
            $table->enum('session_type', ['one_on_one', 'group_mentorship'])->default('group_mentorship');

            // e.g. 'digital_foundations', 'creative_design', 'game_builder', 'media_creator'
            $table->string('chosen_track')->default('digital_foundations');

            // ── Payment ───────────────────────────────────────────────────────
            $table->enum('payment_type', ['onetime', 'installment'])->default('onetime');
            $table->enum('payment_status', ['pending', 'partial', 'completed', 'failed'])->default('pending');
            $table->enum('currency', ['USD', 'NGN'])->default('USD');

            // Price locked at enrollment time
            $table->decimal('total_price', 12, 2)->default(0);       // what they actually pay
            $table->decimal('original_price', 12, 2)->default(0);    // before discount (for display)
            $table->decimal('discount_applied', 12, 2)->default(0);  // saved amount
            $table->decimal('amount_paid', 12, 2)->default(0);

            // Installment: 3 equal monthly payments of full price ÷ 3
            // One-time: 1 payment of discounted price
            $table->integer('total_installments')->default(1);
            $table->integer('installments_paid')->default(0);
            $table->timestamp('next_payment_due')->nullable();
            $table->timestamp('last_payment_at')->nullable();

            $table->boolean('has_access')->default(false);
            $table->boolean('skipped_foundation')->default(false);

            // Payment gateway refs
            $table->string('transaction_id')->nullable();
            $table->string('stripe_session_id')->nullable();
            $table->string('paystack_reference')->nullable();

            // Unique token so parent can resume without an account
            $table->string('resume_token', 64)->unique()->nullable();

            $table->timestamp('enrolled_at')->nullable();
            $table->timestamps();

            $table->index(['parent_email', 'payment_status']);
            $table->index('resume_token');
            $table->index('paired_enrollment_id');
        });

        // ── Kids Installment Payments ─────────────────────────────────────────
        Schema::create('kids_installment_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kids_enrollment_id')->constrained()->cascadeOnDelete();
            $table->integer('installment_number');
            $table->decimal('amount', 12, 2);
            $table->enum('currency', ['USD', 'NGN']);
            $table->enum('status', ['completed', 'failed'])->default('completed');
            $table->string('transaction_id')->nullable();
            $table->string('gateway')->default('stripe');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kids_installment_payments');
        Schema::dropIfExists('kids_enrollments');
        Schema::dropIfExists('kids_courses');
    }
};