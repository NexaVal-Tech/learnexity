<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CourseMaterial;
use App\Models\MaterialItem;
use App\Models\ExternalResource;
use App\Models\AchievementBadge;
use App\Models\CohortLeaderboard;
use App\Models\CohortParticipant;
use App\Models\User;

class AllCoursesResourcesSeeder extends Seeder
{
    public function run(): void
    {
        // Use one of your actual course IDs from coursesData.ts
        $courseId = 'product-management'; // This matches your data structure

        // Create Sprint Materials
        $sprint1 = CourseMaterial::create([
            'course_id' => $courseId,
            'sprint_name' => 'Sprint 1: Foundations',
            'sprint_number' => 1,
            'order' => 1,
        ]);

        MaterialItem::create([
            'course_material_id' => $sprint1->id,
            'title' => 'Introduction to Product Management.pdf',
            'type' => 'pdf',
            'file_path' => 'courses/materials/intro-to-pm.pdf',
            'file_size' => '2.3 MB',
            'order' => 1,
        ]);

        MaterialItem::create([
            'course_material_id' => $sprint1->id,
            'title' => 'Lecture Slides.pptx',
            'type' => 'document',
            'file_path' => 'courses/materials/lecture-slides.pptx',
            'file_size' => '5.2 MB',
            'order' => 2,
        ]);

        MaterialItem::create([
            'course_material_id' => $sprint1->id,
            'title' => 'User Interview Template.docx',
            'type' => 'document',
            'file_path' => 'courses/materials/user-interview-template.docx',
            'file_size' => '1.5 MB',
            'order' => 3,
        ]);

        $sprint2 = CourseMaterial::create([
            'course_id' => $courseId,
            'sprint_name' => 'Sprint 2: Discovery & Research',
            'sprint_number' => 2,
            'order' => 2,
        ]);

        $sprint3 = CourseMaterial::create([
            'course_id' => $courseId,
            'sprint_name' => 'Sprint 3: Ideation & Strategy',
            'sprint_number' => 3,
            'order' => 3,
        ]);

        $sprint4 = CourseMaterial::create([
            'course_id' => $courseId,
            'sprint_name' => 'Sprint 4: Design & Prototyping',
            'sprint_number' => 4,
            'order' => 4,
        ]);

        // External Resources - Video Tutorials
        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'video_tutorials',
            'title' => 'Introduction to Agile Product Management',
            'description' => 'Comprehensive guide to agile methodologies',
            'url' => 'https://youtube.com/watch?v=example1',
            'source' => 'YouTube',
            'duration' => '45:15',
            'order' => 1,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'video_tutorials',
            'title' => 'User Story Mapping Workshop',
            'description' => 'Learn how to create effective user story maps',
            'url' => 'https://youtube.com/watch?v=example2',
            'source' => 'Udemy',
            'duration' => '32:40',
            'order' => 2,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'video_tutorials',
            'title' => 'A/B Testing Best Practices',
            'description' => 'Master the art of experimentation',
            'url' => 'https://youtube.com/watch?v=example3',
            'source' => 'YouTube',
            'duration' => '28:22',
            'order' => 3,
        ]);

        // External Resources - Industry Articles
        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'industry_articles',
            'title' => 'The Future of Product Management',
            'description' => 'Insights into emerging PM trends',
            'url' => 'https://hbr.org/example1',
            'source' => 'Harvard Business Review',
            'order' => 1,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'industry_articles',
            'title' => 'Building Product-User\'s Love',
            'description' => 'Creating products users truly love',
            'url' => 'https://productcoalition.com/example2',
            'source' => 'Product Coalition',
            'order' => 2,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'industry_articles',
            'title' => 'Data-Driven Decision Making',
            'description' => 'Using analytics for product decisions',
            'url' => 'https://mindtheproduct.com/example3',
            'source' => 'Mind the Product',
            'order' => 3,
        ]);

        // External Resources - Recommended Reading
        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'recommended_reading',
            'title' => 'Inspired: How to Create Tech Products',
            'description' => 'Essential reading for product managers',
            'url' => 'https://amazon.com/inspired',
            'source' => 'by Marty Cagan',
            'order' => 1,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'recommended_reading',
            'title' => 'The Lean Startup',
            'description' => 'Build-measure-learn methodology',
            'url' => 'https://amazon.com/lean-startup',
            'source' => 'by Eric Ries',
            'order' => 2,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'recommended_reading',
            'title' => 'Hooked: Building Habit-Forming Products',
            'description' => 'Create products users can\'t put down',
            'url' => 'https://amazon.com/hooked',
            'source' => 'by Nir Eyal',
            'order' => 3,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'recommended_reading',
            'title' => 'Sprint: How to Solve Big Problems',
            'description' => 'Five-day process for solving problems',
            'url' => 'https://amazon.com/sprint',
            'source' => 'by Jake Knapp',
            'order' => 4,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'recommended_reading',
            'title' => 'Escaping the Build Trap',
            'description' => 'Focus on outcomes over outputs',
            'url' => 'https://amazon.com/build-trap',
            'source' => 'by Melissa Perri',
            'order' => 5,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'recommended_reading',
            'title' => 'Marketing 3.0 for Product Teams',
            'description' => 'Modern marketing strategies',
            'url' => 'https://amazon.com/marketing-30',
            'source' => 'Atlassian University',
            'order' => 6,
        ]);

        ExternalResource::create([
            'course_id' => $courseId,
            'category' => 'recommended_reading',
            'title' => 'Analytics with Mixpanel',
            'description' => 'Product analytics deep dive',
            'url' => 'https://mixpanel.com/guides',
            'source' => 'Mixpanel Learn',
            'order' => 7,
        ]);

        // Achievement Badges
        AchievementBadge::create([
            'course_id' => $courseId,
            'name' => 'Sprint 1',
            'description' => 'Introduction to Product Management',
            'badge_color' => '#9333EA',
            'unlock_type' => 'sprint_completion',
            'unlock_value' => 1,
        ]);

        AchievementBadge::create([
            'course_id' => $courseId,
            'name' => 'Sprint 2',
            'description' => 'Introduction to Product Management',
            'badge_color' => '#9333EA',
            'unlock_type' => 'sprint_completion',
            'unlock_value' => 2,
        ]);

        AchievementBadge::create([
            'course_id' => $courseId,
            'name' => 'Sprint 3',
            'description' => 'Introduction to Product Management',
            'badge_color' => '#9333EA',
            'unlock_type' => 'sprint_completion',
            'unlock_value' => 3,
        ]);

        AchievementBadge::create([
            'course_id' => $courseId,
            'name' => 'Sprint 4',
            'description' => 'Introduction to Product Management',
            'badge_color' => '#9333EA',
            'unlock_type' => 'sprint_completion',
            'unlock_value' => 4,
        ]);

        AchievementBadge::create([
            'course_id' => $courseId,
            'name' => 'Course Completion',
            'description' => 'Introduction to Product Management',
            'badge_color' => '#10B981',
            'unlock_type' => 'course_completion',
            'unlock_value' => 1,
        ]);

        // Create Cohort Leaderboard
        $cohort = CohortLeaderboard::create([
            'course_id' => $courseId,
            'cohort_name' => 'Product Management Cohort 2025',
            'start_date' => now()->subDays(30),
            'end_date' => now()->addDays(60),
        ]);

        // Add sample participants to leaderboard
        $users = User::take(5)->get();
        
        if ($users->count() > 0) {
            CohortParticipant::create([
                'cohort_leaderboard_id' => $cohort->id,
                'user_id' => $users[0]->id,
                'rank' => 1,
                'sprint1_score' => 95,
                'sprint2_score' => 92,
                'sprint3_score' => 94,
                'sprint4_score' => 90,
                'overall_score' => 92.75,
            ]);

            if ($users->count() > 1) {
                CohortParticipant::create([
                    'cohort_leaderboard_id' => $cohort->id,
                    'user_id' => $users[1]->id,
                    'rank' => 2,
                    'sprint1_score' => 90,
                    'sprint2_score' => 88,
                    'sprint3_score' => 94,
                    'sprint4_score' => 95,
                    'overall_score' => 91.75,
                ]);
            }

            if ($users->count() > 2) {
                CohortParticipant::create([
                    'cohort_leaderboard_id' => $cohort->id,
                    'user_id' => $users[2]->id,
                    'rank' => 3,
                    'sprint1_score' => 88,
                    'sprint2_score' => 85,
                    'sprint3_score' => 87,
                    'sprint4_score' => 80,
                    'overall_score' => 85,
                ]);
            }

            if ($users->count() > 3) {
                CohortParticipant::create([
                    'cohort_leaderboard_id' => $cohort->id,
                    'user_id' => $users[3]->id,
                    'rank' => 4,
                    'sprint1_score' => 88,
                    'sprint2_score' => 80,
                    'sprint3_score' => 87,
                    'sprint4_score' => 80,
                    'overall_score' => 83.75,
                ]);
            }

            if ($users->count() > 4) {
                CohortParticipant::create([
                    'cohort_leaderboard_id' => $cohort->id,
                    'user_id' => $users[4]->id,
                    'rank' => 5,
                    'sprint1_score' => 85,
                    'sprint2_score' => 75,
                    'sprint3_score' => 82,
                    'sprint4_score' => 78,
                    'overall_score' => 80,
                ]);
            }
        }
    }
}