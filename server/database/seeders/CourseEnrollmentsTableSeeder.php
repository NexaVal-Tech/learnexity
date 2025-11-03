<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CourseEnrollmentsTableSeeder extends Seeder
{
    public function run(): void
    {
        // Fetch existing users and courses
        $users = DB::table('users')->pluck('id')->toArray();
        $courses = DB::table('courses')->select('id', 'title')->get();

        // If either table is empty, stop and warn
        if ($users === [] || $courses->isEmpty()) {
            $this->command->warn('⚠️ Skipping CourseEnrollmentsTableSeeder because users or courses table is empty.');
            return;
        }

        $statuses = ['pending', 'completed', 'failed'];
        $now = now();

        $enrollments = [];

        foreach ($users as $userId) {
            // Each user randomly enrolls in 2–4 courses
            $userCourses = $courses->random(rand(2, 4));

            foreach ($userCourses as $course) {
                $enrollments[] = [
                    'user_id' => $userId,
                    'course_id' => $course->id,
                    'course_name' => $course->title,
                    'course_price' => fake()->randomFloat(2, 5000, 20000),
                    'payment_status' => fake()->randomElement($statuses),
                    'transaction_id' => strtoupper(Str::random(10)),
                    'enrollment_date' => now()->subDays(rand(1, 30)),
                    'payment_date' => now()->subDays(rand(0, 30)),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        DB::table('course_enrollments')->insert($enrollments);

        $this->command->info('✅ CourseEnrollmentsTableSeeder completed successfully!');
    }
}
