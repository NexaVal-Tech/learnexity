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
 * Session formats:
 *   - Starter Group  (5–10 kids) → cheapest tier
 *   - Mini Group     (3–5 kids)  → mid tier
 *   - One-on-One                 → premium tier
 *
 * Pricing logic:
 *   - One-time payment   → onetime_discount_percent applied (reward for paying in full)
 *   - Installment (3 mo) → full price, NO discount
 *
 * To update prices:
 *   1. Edit the constants below
 *   2. php artisan db:seed --class=KidsCoursesSeeder
 *
 * ⚠️  Migration required before running this seeder:
 *   Add these columns to kids_courses if they don't exist:
 *     starter_group_price_usd        DECIMAL(10,2) DEFAULT 0
 *     starter_group_price_ngn        DECIMAL(12,2) DEFAULT 0
 *     bundle_starter_group_usd       DECIMAL(10,2) DEFAULT 0
 *     bundle_starter_group_ngn       DECIMAL(12,2) DEFAULT 0
 */
class KidsCoursesSeeder extends Seeder
{
    // ──────────────────────────────────────────────────────────────────────────
    // 🔧 PRICE VARIABLES — tweak these freely
    // ──────────────────────────────────────────────────────────────────────────

    // ── Digital Foundations (1 month standalone) ──────────────────────────────
    const DF_ONE_ON_ONE_USD       = 200.00;
    const DF_GROUP_USD            = 100.00;
    const DF_STARTER_GROUP_USD    = 50.00;    // ← NEW: Starter Group (5–10 kids)
    const DF_ONE_ON_ONE_NGN       = 200000.00;
    const DF_GROUP_NGN            = 100000.00;
    const DF_STARTER_GROUP_NGN    = 50000.00; // ← NEW

    // ── Specialisation tracks — STANDALONE (2 months, without DF) ─────────────
    const TRACK_ONE_ON_ONE_USD       = 400.00;   // 2 months × $200
    const TRACK_GROUP_USD            = 200.00;   // 2 months × $100
    const TRACK_STARTER_GROUP_USD    = 100.00;   // 2 months × $50  ← NEW
    const TRACK_ONE_ON_ONE_NGN       = 400000.00;
    const TRACK_GROUP_NGN            = 200000.00;
    const TRACK_STARTER_GROUP_NGN    = 100000.00; // ← NEW

    // ── Bundle prices (DF 1 month + Track 2 months = 3 months total) ──────────
    const BUNDLE_ONE_ON_ONE_USD       = 600.00;   // 3 months × $200
    const BUNDLE_GROUP_USD            = 300.00;   // 3 months × $100
    const BUNDLE_STARTER_GROUP_USD    = 150.00;   // 3 months × $50  ← NEW
    const BUNDLE_ONE_ON_ONE_NGN       = 600000.00;
    const BUNDLE_GROUP_NGN            = 300000.00;
    const BUNDLE_STARTER_GROUP_NGN    = 150000.00; // ← NEW

    // ── One-time discount (%) ──────────────────────────────────────────────────
    const ONETIME_DISCOUNT_PERCENT = 12.00;

    // ──────────────────────────────────────────────────────────────────────────

    public function run(): void
    {
        $now = now();

        $courses = [
            // ── Digital Foundations ───────────────────────────────────────────
            [
                'slug'                     => 'digital-foundations',
                'name'                     => 'Digital Foundations',
                'description'              => 'Every child starts here. Build computer confidence, critical thinking, and core digital skills before specialising.',
                'emoji'                    => '🏗️',
                'color'                    => '#4A3AFF',
                'duration_months'          => 1,
                'is_foundation'            => true,

                // Standalone prices
                'one_on_one_price_usd'     => self::DF_ONE_ON_ONE_USD,
                'group_price_usd'          => self::DF_GROUP_USD,
                'starter_group_price_usd'  => self::DF_STARTER_GROUP_USD,    // ← NEW
                'one_on_one_price_ngn'     => self::DF_ONE_ON_ONE_NGN,
                'group_price_ngn'          => self::DF_GROUP_NGN,
                'starter_group_price_ngn'  => self::DF_STARTER_GROUP_NGN,    // ← NEW

                // No bundle prices on the foundation course itself
                'bundle_one_on_one_usd'    => 0,
                'bundle_group_usd'         => 0,
                'bundle_starter_group_usd' => 0,                              // ← NEW
                'bundle_one_on_one_ngn'    => 0,
                'bundle_group_ngn'         => 0,
                'bundle_starter_group_ngn' => 0,                              // ← NEW

                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'                => true,
                'order'                    => 1,
                'created_at'               => $now,
                'updated_at'               => $now,
            ],

            // ── Creative Design ───────────────────────────────────────────────
            [
                'slug'                     => 'creative-design',
                'name'                     => 'Creative Design',
                'description'              => 'From "I like drawing" to creating real digital designs. Structured design thinking for young visual minds.',
                'emoji'                    => '🎨',
                'color'                    => '#4A3AFF',
                'duration_months'          => 2,
                'is_foundation'            => false,

                'one_on_one_price_usd'     => self::TRACK_ONE_ON_ONE_USD,
                'group_price_usd'          => self::TRACK_GROUP_USD,
                'starter_group_price_usd'  => self::TRACK_STARTER_GROUP_USD,  // ← NEW
                'one_on_one_price_ngn'     => self::TRACK_ONE_ON_ONE_NGN,
                'group_price_ngn'          => self::TRACK_GROUP_NGN,
                'starter_group_price_ngn'  => self::TRACK_STARTER_GROUP_NGN,  // ← NEW

                'bundle_one_on_one_usd'    => self::BUNDLE_ONE_ON_ONE_USD,
                'bundle_group_usd'         => self::BUNDLE_GROUP_USD,
                'bundle_starter_group_usd' => self::BUNDLE_STARTER_GROUP_USD, // ← NEW
                'bundle_one_on_one_ngn'    => self::BUNDLE_ONE_ON_ONE_NGN,
                'bundle_group_ngn'         => self::BUNDLE_GROUP_NGN,
                'bundle_starter_group_ngn' => self::BUNDLE_STARTER_GROUP_NGN, // ← NEW

                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'                => true,
                'order'                    => 2,
                'created_at'               => $now,
                'updated_at'               => $now,
            ],

            // ── Game Builder ──────────────────────────────────────────────────
            [
                'slug'                     => 'game-builder',
                'name'                     => 'Game Builder',
                'description'              => 'Your child learns how games actually work by creating their own — turning passive gaming into real skills.',
                'emoji'                    => '🎮',
                'color'                    => '#4A3AFF',
                'duration_months'          => 2,
                'is_foundation'            => false,

                'one_on_one_price_usd'     => self::TRACK_ONE_ON_ONE_USD,
                'group_price_usd'          => self::TRACK_GROUP_USD,
                'starter_group_price_usd'  => self::TRACK_STARTER_GROUP_USD,  // ← NEW
                'one_on_one_price_ngn'     => self::TRACK_ONE_ON_ONE_NGN,
                'group_price_ngn'          => self::TRACK_GROUP_NGN,
                'starter_group_price_ngn'  => self::TRACK_STARTER_GROUP_NGN,  // ← NEW

                'bundle_one_on_one_usd'    => self::BUNDLE_ONE_ON_ONE_USD,
                'bundle_group_usd'         => self::BUNDLE_GROUP_USD,
                'bundle_starter_group_usd' => self::BUNDLE_STARTER_GROUP_USD, // ← NEW
                'bundle_one_on_one_ngn'    => self::BUNDLE_ONE_ON_ONE_NGN,
                'bundle_group_ngn'         => self::BUNDLE_GROUP_NGN,
                'bundle_starter_group_ngn' => self::BUNDLE_STARTER_GROUP_NGN, // ← NEW

                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'                => true,
                'order'                    => 3,
                'created_at'               => $now,
                'updated_at'               => $now,
            ],

            // ── Media Creator ─────────────────────────────────────────────────
            [
                'slug'                     => 'media-creator',
                'name'                     => 'Media Creator',
                'description'              => 'Instead of just watching videos, your child learns how to create them — editing, producing, and storytelling.',
                'emoji'                    => '🎬',
                'color'                    => '#4A3AFF',
                'duration_months'          => 2,
                'is_foundation'            => false,

                'one_on_one_price_usd'     => self::TRACK_ONE_ON_ONE_USD,
                'group_price_usd'          => self::TRACK_GROUP_USD,
                'starter_group_price_usd'  => self::TRACK_STARTER_GROUP_USD,  // ← NEW
                'one_on_one_price_ngn'     => self::TRACK_ONE_ON_ONE_NGN,
                'group_price_ngn'          => self::TRACK_GROUP_NGN,
                'starter_group_price_ngn'  => self::TRACK_STARTER_GROUP_NGN,  // ← NEW

                'bundle_one_on_one_usd'    => self::BUNDLE_ONE_ON_ONE_USD,
                'bundle_group_usd'         => self::BUNDLE_GROUP_USD,
                'bundle_starter_group_usd' => self::BUNDLE_STARTER_GROUP_USD, // ← NEW
                'bundle_one_on_one_ngn'    => self::BUNDLE_ONE_ON_ONE_NGN,
                'bundle_group_ngn'         => self::BUNDLE_GROUP_NGN,
                'bundle_starter_group_ngn' => self::BUNDLE_STARTER_GROUP_NGN, // ← NEW

                'onetime_discount_percent' => self::ONETIME_DISCOUNT_PERCENT,
                'is_active'                => true,
                'order'                    => 4,
                'created_at'               => $now,
                'updated_at'               => $now,
            ],
        ];

        foreach ($courses as $course) {
            DB::table('kids_courses')->updateOrInsert(
                ['slug' => $course['slug']],
                $course
            );
        }

        $this->command->info('✅ Kids courses seeded successfully.');
        $this->command->line('');
        $this->command->line('   ── Standalone prices ──────────────────────────────');
        $this->command->line('   DF Starter Group:   $' . self::DF_STARTER_GROUP_USD . ' / ₦' . number_format(self::DF_STARTER_GROUP_NGN));
        $this->command->line('   DF Mini Group:      $' . self::DF_GROUP_USD . ' / ₦' . number_format(self::DF_GROUP_NGN));
        $this->command->line('   DF One-on-One:      $' . self::DF_ONE_ON_ONE_USD . ' / ₦' . number_format(self::DF_ONE_ON_ONE_NGN));
        $this->command->line('');
        $this->command->line('   ── Track-only prices (2 months) ───────────────────');
        $this->command->line('   Starter Group:      $' . self::TRACK_STARTER_GROUP_USD . ' / ₦' . number_format(self::TRACK_STARTER_GROUP_NGN));
        $this->command->line('   Mini Group:         $' . self::TRACK_GROUP_USD . ' / ₦' . number_format(self::TRACK_GROUP_NGN));
        $this->command->line('   One-on-One:         $' . self::TRACK_ONE_ON_ONE_USD . ' / ₦' . number_format(self::TRACK_ONE_ON_ONE_NGN));
        $this->command->line('');
        $this->command->line('   ── Bundle prices (3 months) ────────────────────────');
        $this->command->line('   Starter Group:      $' . self::BUNDLE_STARTER_GROUP_USD . ' / ₦' . number_format(self::BUNDLE_STARTER_GROUP_NGN));
        $this->command->line('   Mini Group:         $' . self::BUNDLE_GROUP_USD . ' / ₦' . number_format(self::BUNDLE_GROUP_NGN));
        $this->command->line('   One-on-One:         $' . self::BUNDLE_ONE_ON_ONE_USD . ' / ₦' . number_format(self::BUNDLE_ONE_ON_ONE_NGN));
        $this->command->line('');
        $this->command->line('   One-time disc:  ' . self::ONETIME_DISCOUNT_PERCENT . '%');
    }
}