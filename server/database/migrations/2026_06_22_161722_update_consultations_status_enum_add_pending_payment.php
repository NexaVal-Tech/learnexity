<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // SQLite's enum is just a CHECK constraint with no ALTER support,
            // so swap it for a plain string + app-level validation instead.
            Schema::table('consultations', function (Blueprint $table) {
                $table->string('status_new')->default('scheduled')->after('status');
            });

            DB::statement('UPDATE consultations SET status_new = status');

            Schema::table('consultations', function (Blueprint $table) {
                $table->dropColumn('status');
            });

            Schema::table('consultations', function (Blueprint $table) {
                $table->renameColumn('status_new', 'status');
                $table->index('status'); // re-add since dropColumn killed the old index
            });
        } else {
            DB::statement(
                "ALTER TABLE consultations MODIFY COLUMN status ENUM('scheduled','pending_payment','completed','cancelled','no_show') DEFAULT 'scheduled'"
            );
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            // Not reversible cleanly without risking data loss; no-op.
            return;
        }

        DB::statement(
            "ALTER TABLE consultations MODIFY COLUMN status ENUM('scheduled','completed','cancelled','no_show') DEFAULT 'scheduled'"
        );
    }
};