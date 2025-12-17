<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Course;

class CourseLearningTracksSeeder extends Seeder
{
    public function run(): void
    {
        // Update all existing courses with default learning tracks
        Course::query()->update([
            'offers_self_paced' => true,
            'offers_group_mentorship' => true,
            'offers_one_on_one' => false, // Premium feature
        ]);

        // Set pricing based on base price
        Course::all()->each(function ($course) {
            $course->update([
                'self_paced_price' => $course->price * 0.5,
                'group_mentorship_price' => $course->price * 0.7,
                'one_on_one_price' => $course->price, // Full price for 1-on-1
            ]);
        });

        $this->command->info('✅ Learning tracks updated for all courses');
    }
}