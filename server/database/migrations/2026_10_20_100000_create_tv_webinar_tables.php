<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Learnexity TV webinar (tv.learnexity.org):
 *  - tv_webinar_settings: one row — title, date, prices, join/recording links.
 *  - tv_registrations: everyone who registered (free or premium) + payment
 *    and consultation tracking for the admin.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('tv_webinar_settings')) {
            Schema::create('tv_webinar_settings', function (Blueprint $table) {
                $table->id();
                $table->string('title')->default('Superintelligence is Coming. Is Your Career Ready?');
                $table->timestamp('event_at')->nullable();
                $table->string('event_time_label')->nullable(); // e.g. "Saturday, Nov 8 · 12pm ET"
                $table->decimal('price_usd', 10, 2)->default(20);
                $table->decimal('price_ngn', 12, 2)->nullable();   // empty = everyone pays in USD (Stripe)
                $table->string('join_link', 1000)->nullable();
                $table->string('recording_link', 1000)->nullable();
                $table->string('whatsapp_number', 30)->default('12762528415');
                $table->boolean('registration_open')->default(true);
                $table->boolean('premium_open')->default(true);
                $table->unsignedInteger('premium_capacity')->nullable(); // empty = unlimited
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('tv_registrations')) {
            Schema::create('tv_registrations', function (Blueprint $table) {
                $table->id();
                $table->string('full_name');
                $table->string('email')->unique();
                $table->string('phone', 40)->nullable();
                $table->string('tier', 20)->default('free'); // free | premium
                $table->string('learn_about', 500)->nullable();
                $table->string('career_concern', 500)->nullable();
                $table->string('heard_from', 30)->nullable();
                $table->string('consultation_focus', 30)->nullable(); // career | monetization

                // none | pending | paid | failed
                $table->string('payment_status', 20)->default('none')->index();
                $table->decimal('amount', 12, 2)->nullable();
                $table->string('currency', 3)->nullable();
                $table->string('payment_method', 20)->nullable(); // stripe | paystack | manual
                $table->string('transaction_id')->nullable()->index();
                $table->timestamp('paid_at')->nullable();

                // not_applicable | to_schedule | scheduled | done
                $table->string('consultation_status', 20)->default('not_applicable')->index();
                $table->timestamp('consultation_at')->nullable();
                $table->text('admin_notes')->nullable();

                $table->timestamp('join_link_sent_at')->nullable();
                $table->timestamp('recording_sent_at')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tv_registrations');
        Schema::dropIfExists('tv_webinar_settings');
    }
};
