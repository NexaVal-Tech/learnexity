<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('one_on_one_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->constrained('course_enrollments')->onDelete('cascade');
            $table->unsignedBigInteger('user_id');
            $table->string('course_id');
            $table->integer('hours_booked')->default(1);
            $table->decimal('amount_paid', 10, 2);
            $table->string('currency', 10);
            $table->string('transaction_id')->nullable();
            $table->timestamp('booked_at')->nullable();
            $table->timestamps();
            $table->index(['enrollment_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('one_on_one_bookings');
    }
};
