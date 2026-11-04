<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Footer CTA: "Book Free Consultation" → "Talk to Expert".
 * Only changes the saved footer if it still has the old wording, so any
 * text an admin chose in Website CMS → Footer is left alone.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('cms_globals')) return;

        $row = DB::table('cms_globals')->where('key', 'footer')->first();
        if (!$row) return;

        $data = json_decode((string) $row->data, true);
        if (!is_array($data)) return;

        $label = $data['ctaSecondary']['label'] ?? null;
        if (is_string($label) && strcasecmp(trim($label), 'Book Free Consultation') === 0) {
            $data['ctaSecondary']['label'] = 'Talk to Expert';
            DB::table('cms_globals')->where('key', 'footer')->update([
                'data'       => json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Nothing to undo — the label can be edited in Website CMS → Footer.
    }
};
