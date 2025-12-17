<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            // Learning track availability flags
            $table->boolean('offers_one_on_one')->default(false)->after('is_premium');
            $table->boolean('offers_group_mentorship')->default(false)->after('offers_one_on_one');
            $table->boolean('offers_self_paced')->default(true)->after('offers_group_mentorship');
            
            // Pricing for each track
            $table->decimal('one_on_one_price', 10, 2)->nullable()->after('offers_self_paced');
            $table->decimal('group_mentorship_price', 10, 2)->nullable()->after('one_on_one_price');
            $table->decimal('self_paced_price', 10, 2)->nullable()->after('group_mentorship_price');
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn([
                'offers_one_on_one',
                'offers_group_mentorship',
                'offers_self_paced',
                'one_on_one_price',
                'group_mentorship_price',
                'self_paced_price',
            ]);
        });
    }
};