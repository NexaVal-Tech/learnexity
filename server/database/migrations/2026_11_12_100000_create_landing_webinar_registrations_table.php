<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('landing_webinar_registrations')) return;

        Schema::create('landing_webinar_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('email', 190)->index();
            $table->string('country', 80)->nullable();
            $table->string('interest', 500)->nullable();
            $table->string('heard_from', 300)->nullable();
            $table->string('webinar_title', 200)->nullable()->index();
            $table->string('ip_hash', 64)->nullable();
            $table->timestamps();

            $table->unique(['email', 'webinar_title']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_webinar_registrations');
    }
};
