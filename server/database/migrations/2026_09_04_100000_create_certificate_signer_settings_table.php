<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Single platform-wide "who signs certificates" setting — one director
     * name + signature image, reused on every course-completion certificate
     * (and, if configured, on badge artifacts too). Singleton row, same
     * current()-or-create pattern as RegistrationFeeSetting.
     */
    public function up(): void
    {
        Schema::create('certificate_signer_settings', function (Blueprint $table) {
            $table->id();
            $table->string('signer_name')->default('');
            $table->string('signer_title')->nullable();
            $table->string('signature_path')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_signer_settings');
    }
};
