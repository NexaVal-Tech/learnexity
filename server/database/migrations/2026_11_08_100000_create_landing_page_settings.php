<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Marketing landing page (landing/index.html on its own subdomain).
 * One row: every text, button, image and section switch (content JSON),
 * plus the Meta Pixel ID. Offer fees are NOT stored here — they come live
 * from Registration Fee settings so they always match checkout.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('landing_page_settings')) {
            Schema::create('landing_page_settings', function (Blueprint $table) {
                $table->id();
                $table->json('content')->nullable();
                $table->string('meta_pixel_id', 30)->nullable();
                $table->unsignedBigInteger('updated_by')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_page_settings');
    }
};
