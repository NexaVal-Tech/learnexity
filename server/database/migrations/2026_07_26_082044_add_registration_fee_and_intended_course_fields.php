<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Lets the backend remember which course a person wants to enroll in,
        // even if they close the browser — this is what the dashboard
        // onboarding modal reads to know where to send them next.
        Schema::table('users', function (Blueprint $table) {
            $table->string('intended_course_id')->nullable()->after('email');
        });

        // Ties an enrollment to the scholarship that paid for it (if any) and
        // flags whether it was billed at the flat registration fee instead of
        // the course price.
        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->unsignedBigInteger('scholarship_id')->nullable()->after('course_id');
            $table->boolean('is_registration_fee')->default(false)->after('total_amount');
        });

        // Single platform-wide registration fee, configured by the admin.
        // One row is enough — see RegistrationFeeSetting::current().
        Schema::create('registration_fee_settings', function (Blueprint $table) {
            $table->id();
            $table->decimal('price_usd', 10, 2)->default(0);
            $table->decimal('price_ngn', 10, 2)->default(0);
            $table->timestamps();
        });

        DB::table('registration_fee_settings')->insert([
            'price_usd'  => 0,
            'price_ngn'  => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('intended_course_id');
        });

        Schema::table('course_enrollments', function (Blueprint $table) {
            $table->dropColumn(['scholarship_id', 'is_registration_fee']);
        });

        Schema::dropIfExists('registration_fee_settings');
    }
};