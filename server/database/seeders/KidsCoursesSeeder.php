<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * KidsCoursesSeeder
 *
 * Course structure:
 *   - Digital Foundations  → 1 month  (foundation, no bundle prices needed)
 *   - Creative Design      → 2 months (standalone OR bundled with DF = 3 months total)
 *   - Game Builder         → 2 months (standalone OR bundled with DF = 3 months total)
 *   - Media Creator        → 2 months (standalone OR bundled with DF = 3 months total)
 *
 * Pricing logic:
 *   - One-time payment     → onetime_discount_percent applied  (reward for paying in full)
 *   - Installment (3 mo)   → full price, NO discount
 *
 * To update prices:
 *   1. Edit the constants below
 *   2. php artisan db:seed --class=KidsCoursesSeeder
 */
class KidsCoursesSeeder extends Seeder
{
    // ──────────────────────────────────────────────────────────────────────────
    // 🔧 PRICE VARIABLES — tweak these freely
    // ──────────────────────────────────────────────────────────────────────────

    // ── Digital Foundations (1 month standalone) ──────────────────────────────
    const DF_ONE_ON_ONE_USD = 200.00;   // 1 month × $200
    const DF_GROUP_USD      = 100.00;   // 1 month × $100
    const DF_ONE_ON_ONE_NGN = 200000.00;
    const DF_GROUP_NGN      = 100000.00;

    // ── Specialisation tracks — STANDALONE (2 months, without DF) ─────────────
    const TRACK_ONE_ON_ONE_USD = 400.00;   // 2 months × $200
    const TRACK_GROUP_USD      = 200.00;   // 2 months × $100
    const TRACK_ONE_ON_ONE_NGN = 400000.00;
    const TRACK_GROUP_NGN      = 200000.00;

    // ── Bundle prices (DF 1 month + Track 2 months = 3 months total) ──────────
    const BUNDLE_ONE_ON_ONE_USD = 600.00;   // 3 months × $200
    const BUNDLE_GROUP_USD      = 300.00;   // 3 months × $100
    const BUNDLE_ONE_ON_ONE_NGN = 600000.00;
    const BUNDLE_GROUP_NGN      = 300000.00;

    // ── One-time discount (%) ──────────────────────────────────────────────────
    const ONETIME_DISCOUNT_PERCENT = 12.00;

    // ──────────────────────────────────────────────────────────────────────────

    public function run(): void
    {
        $now = now();

        $courses = [
            // ── Digital Foundations ───────────────────────────────────────────
            [
                'slug'                    => 'digital-foundations',
                'name'                    => 'Digital Foundations',
                'description'             => 'Every child starts here. Build computer confidence, critical thinking, and core digital skills before specialising.',
                'emoji'                   => '🏗️',
                'color'                   => '#4A3AFF',
                'duration_months'         => 1,           // ← 1 month
                'is_foundation'           => true,
                'one_on_one_price_usd'    => self::DF_ONE_ON_ONE_USD,
                'group_price_usd'         => self::DF_GROUP_USD,
                'one_on_one_price_ngn'    => self::DF_ONE_ON_ONE_NGN,
                'group_price_ngn'         => self::DF_GROUP_NGN,
                // No bundle prices on the foundation course itself
                'bundle_one_on_one_usd'   => 0,
                'bundle_group_usd'        => 0,
                'bundle_one_on_one_ngn'   => 0,
                'bundle_group_ngn'        => 0,
                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'               => true,
                'order'                   => 1,
                'created_at'              => $now,
                'updated_at'              => $now,
            ],

            // ── Creative Design ───────────────────────────────────────────────
            [
                'slug'                    => 'creative-design',
                'name'                    => 'Creative Design',
                'description'             => 'From "I like drawing" to creating real digital designs. Structured design thinking for young visual minds.',
                'emoji'                   => '🎨',
                'color'                   => '#4A3AFF',
                'duration_months'         => 2,           // ← 2 months
                'is_foundation'           => false,
                'one_on_one_price_usd'    => self::TRACK_ONE_ON_ONE_USD,
                'group_price_usd'         => self::TRACK_GROUP_USD,
                'one_on_one_price_ngn'    => self::TRACK_ONE_ON_ONE_NGN,
                'group_price_ngn'         => self::TRACK_GROUP_NGN,
                'bundle_one_on_one_usd'   => self::BUNDLE_ONE_ON_ONE_USD,
                'bundle_group_usd'        => self::BUNDLE_GROUP_USD,
                'bundle_one_on_one_ngn'   => self::BUNDLE_ONE_ON_ONE_NGN,
                'bundle_group_ngn'        => self::BUNDLE_GROUP_NGN,
                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'               => true,
                'order'                   => 2,
                'created_at'              => $now,
                'updated_at'              => $now,
            ],

            // ── Game Builder ──────────────────────────────────────────────────
            [
                'slug'                    => 'game-builder',
                'name'                    => 'Game Builder',
                'description'             => 'Your child learns how games actually work by creating their own — turning passive gaming into real skills.',
                'emoji'                   => '🎮',
                'color'                   => '#4A3AFF',
                'duration_months'         => 2,
                'is_foundation'           => false,
                'one_on_one_price_usd'    => self::TRACK_ONE_ON_ONE_USD,
                'group_price_usd'         => self::TRACK_GROUP_USD,
                'one_on_one_price_ngn'    => self::TRACK_ONE_ON_ONE_NGN,
                'group_price_ngn'         => self::TRACK_GROUP_NGN,
                'bundle_one_on_one_usd'   => self::BUNDLE_ONE_ON_ONE_USD,
                'bundle_group_usd'        => self::BUNDLE_GROUP_USD,
                'bundle_one_on_one_ngn'   => self::BUNDLE_ONE_ON_ONE_NGN,
                'bundle_group_ngn'        => self::BUNDLE_GROUP_NGN,
                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'               => true,
                'order'                   => 3,
                'created_at'              => $now,
                'updated_at'              => $now,
            ],

            // ── Media Creator ─────────────────────────────────────────────────
            [
                'slug'                    => 'media-creator',
                'name'                    => 'Media Creator',
                'description'             => 'Instead of just watching videos, your child learns how to create them — editing, producing, and storytelling.',
                'emoji'                   => '🎬',
                'color'                   => '#4A3AFF',
                'duration_months'         => 2,
                'is_foundation'           => false,
                'one_on_one_price_usd'    => self::TRACK_ONE_ON_ONE_USD,
                'group_price_usd'         => self::TRACK_GROUP_USD,
                'one_on_one_price_ngn'    => self::TRACK_ONE_ON_ONE_NGN,
                'group_price_ngn'         => self::TRACK_GROUP_NGN,
                'bundle_one_on_one_usd'   => self::BUNDLE_ONE_ON_ONE_USD,
                'bundle_group_usd'        => self::BUNDLE_GROUP_USD,
                'bundle_one_on_one_ngn'   => self::BUNDLE_ONE_ON_ONE_NGN,
                'bundle_group_ngn'        => self::BUNDLE_GROUP_NGN,
                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'               => true,
                'order'                   => 4,
                'created_at'              => $now,
                'updated_at'              => $now,
            ],
        ];

        foreach ($courses as $course) {
            DB::table('kids_courses')->updateOrInsert(
                ['slug' => $course['slug']],
                $course
            );
        }

        $this->command->info('✅ Kids courses seeded successfully.');
        $this->command->line('   DF standalone:  $' . self::DF_GROUP_USD . ' group / $' . self::DF_ONE_ON_ONE_USD . ' 1-on-1');
        $this->command->line('   Track only:     $' . self::TRACK_GROUP_USD . ' group / $' . self::TRACK_ONE_ON_ONE_USD . ' 1-on-1');
        $this->command->line('   Bundle (3 mo):  $' . self::BUNDLE_GROUP_USD . ' group / $' . self::BUNDLE_ONE_ON_ONE_USD . ' 1-on-1');
        $this->command->line('   One-time disc:  ' . self::ONETIME_DISCOUNT_PERCENT . '%');
    }
}