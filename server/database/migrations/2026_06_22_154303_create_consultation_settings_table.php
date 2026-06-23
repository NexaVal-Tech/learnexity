<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultation_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('price_usd', 10, 2)->default(10);
            $table->decimal('price_ngn', 10, 2)->default(10000);
            $table->timestamps();
        });

        DB::table('consultation_settings')->insert([
            'price_usd' => 10,
            'price_ngn' => 10000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_settings');
    }
};