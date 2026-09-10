<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Single platform-wide setting (mirrors registration_fee_settings'
     * singleton-row pattern) holding the scholarship application deadline
     * shown as a countdown banner on the homepage. `is_active` lets the
     * admin turn the banner off without losing the configured date.
     */
    public function up(): void
    {
        Schema::create('scholarship_settings', function (Blueprint $table) {
            $table->id();
            $table->timestamp('deadline')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        DB::table('scholarship_settings')->insert([
            'deadline'   => null,
            'is_active'  => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('scholarship_settings');
    }
};
