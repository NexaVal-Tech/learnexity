// database/migrations/2026_07_04_000001_create_registration_otps_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_otps', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('referral_code')->nullable();

            $table->string('otp_hash');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');

            $table->timestamp('verified_at')->nullable();
            $table->string('token_hash')->nullable();
            $table->timestamp('token_expires_at')->nullable();

            $table->unsignedTinyInteger('resend_count')->default(0);
            $table->timestamp('last_sent_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_otps');
    }
};