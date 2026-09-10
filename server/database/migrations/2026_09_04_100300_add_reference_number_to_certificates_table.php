<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Adds a short, human-readable reference number to certificates —
     * sequential, derived from the row's own auto-increment id
     * (LX-CERT-000123), separate from the long certificate_uid used for
     * shareable download links. Backfills existing rows so nothing is
     * left blank.
     */
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->string('reference_number')->nullable()->unique()->after('certificate_uid');
        });

        DB::table('certificates')->orderBy('id')->select('id')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                DB::table('certificates')
                    ->where('id', $row->id)
                    ->update(['reference_number' => 'LX-CERT-' . str_pad((string) $row->id, 6, '0', STR_PAD_LEFT)]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->dropColumn('reference_number');
        });
    }
};
