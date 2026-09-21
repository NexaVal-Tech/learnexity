<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Admin-configurable booking availability windows for consultations.
     *
     * Two modes, distinguished by `is_recurring`:
     *  - Recurring weekly: `weekday` (0=Sun..6=Sat) is set, `specific_date` is null.
     *    Applies every week on that weekday until deactivated.
     *  - One-off: `specific_date` is set, `weekday` is null. Applies only that date.
     *
     * `source` scopes a rule to 'learnexity' or 'advisory' only; null applies to both.
     * When no rows exist at all for a source, controllers fall back to the
     * historical hardcoded Mon–Fri, 9:00 AM–4:30 PM / 30-min-slot behavior so
     * existing bookings keep working exactly as before until an admin
     * configures something explicitly.
     */
    public function up(): void
    {
        Schema::create('consultation_availabilities', function (Blueprint $table) {
            $table->id();
            $table->string('source')->nullable(); // 'learnexity' | 'advisory' | null (both)
            $table->unsignedTinyInteger('weekday')->nullable(); // 0=Sun..6=Sat
            $table->date('specific_date')->nullable();
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedSmallInteger('slot_interval_minutes')->default(30);
            $table->boolean('is_recurring')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('label')->nullable();
            $table->timestamps();

            $table->index(['source', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultation_availabilities');
    }
};
