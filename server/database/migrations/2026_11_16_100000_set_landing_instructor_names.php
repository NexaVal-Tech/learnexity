<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Landing page (main.learnexity.org): show these instructors from Meet Our
 * Team, in this order. Only fills the list if the admin hasn't picked any
 * names yet — an existing selection is left alone. Editable afterwards in
 * Admin → Landing Page → Meet your instructors.
 */
return new class extends Migration
{
    private const NAMES = ['Hannah Francis', 'Adebola Fadairo', 'Mary Jules Mrsick', 'Emmanuel Vincent', 'Daniel Adeboye'];

    public function up(): void
    {
        if (!Schema::hasTable('landing_page_settings')) return;

        foreach (DB::table('landing_page_settings')->get() as $row) {
            if (!$row->content) continue; // nothing saved yet → the defaults already contain these names
            $content = json_decode($row->content, true);
            if (!is_array($content)) continue;
            if (!empty($content['instructors']['names'])) continue;
            $content['instructors'] = array_merge($content['instructors'] ?? [], ['names' => self::NAMES]);
            DB::table('landing_page_settings')->where('id', $row->id)->update([
                'content'    => json_encode($content, JSON_UNESCAPED_UNICODE),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // Leave the selection in place.
    }
};
