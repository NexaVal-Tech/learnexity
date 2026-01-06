<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * @property int $id
 * @property string $course_id
 * @property string $name
 * @property string $description
 * @property string|null $badge_icon
 * @property string $badge_color
 * @property string $unlock_type
 * @property int $unlock_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserBadge> $userBadges
 * @property-read int|null $user_badges_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereBadgeColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereBadgeIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereUnlockType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereUnlockValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AchievementBadge whereUpdatedAt($value)
 */
	class AchievementBadge extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Admin whereUpdatedAt($value)
 */
	class Admin extends \Eloquent implements \Tymon\JWTAuth\Contracts\JWTSubject {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $course_id
 * @property string $cohort_name
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CohortParticipant> $participants
 * @property-read int|null $participants_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard whereCohortName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortLeaderboard whereUpdatedAt($value)
 */
	class CohortLeaderboard extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $cohort_leaderboard_id
 * @property int $user_id
 * @property int $rank
 * @property numeric $sprint1_score
 * @property numeric $sprint2_score
 * @property numeric $sprint3_score
 * @property numeric $sprint4_score
 * @property numeric $overall_score
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\CohortLeaderboard $cohort
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereCohortLeaderboardId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereOverallScore($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereRank($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereSprint1Score($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereSprint2Score($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereSprint3Score($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereSprint4Score($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CohortParticipant whereUserId($value)
 */
	class CohortParticipant extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $course_id
 * @property string $title
 * @property string|null $project
 * @property string $description
 * @property string|null $hero_image
 * @property string|null $secondary_image
 * @property string|null $duration
 * @property string|null $level
 * @property numeric $price
 * @property bool $is_freemium
 * @property bool $is_premium
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property bool $offers_one_on_one
 * @property bool $offers_group_mentorship
 * @property bool $offers_self_paced
 * @property numeric|null $one_on_one_price
 * @property numeric|null $group_mentorship_price
 * @property numeric|null $self_paced_price
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseBenefit> $benefits
 * @property-read int|null $benefits_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseCareerPath> $careerPaths
 * @property-read int|null $career_paths_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseEnrollment> $enrollments
 * @property-read int|null $enrollments_count
 * @property-read array $available_tracks
 * @property-read array $track_pricing
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseIndustry> $industries
 * @property-read int|null $industries_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseLearning> $learnings
 * @property-read int|null $learnings_count
 * @property-read \App\Models\CourseSalary|null $salary
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseTool> $tools
 * @property-read int|null $tools_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereGroupMentorshipPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereHeroImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereIsFreemium($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereIsPremium($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereOffersGroupMentorship($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereOffersOneOnOne($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereOffersSelfPaced($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereOneOnOnePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereProject($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereSecondaryImage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereSelfPacedPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Course whereUpdatedAt($value)
 */
	class Course extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property string $text
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit whereText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseBenefit whereUpdatedAt($value)
 */
	class CourseBenefit extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string $level
 * @property string $position
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath whereLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseCareerPath whereUpdatedAt($value)
 */
	class CourseCareerPath extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $course_id
 * @property string $course_name
 * @property numeric $course_price
 * @property string $payment_status
 * @property string|null $transaction_id
 * @property \Illuminate\Support\Carbon $enrollment_date
 * @property \Illuminate\Support\Carbon|null $payment_date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $learning_track
 * @property-read \App\Models\Course|null $course
 * @property-read string $learning_track_name
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment paid()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment pending()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereCourseName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereCoursePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereEnrollmentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereLearningTrack($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment wherePaymentDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereTransactionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseEnrollment whereUserId($value)
 */
	class CourseEnrollment extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string $title
 * @property string $text
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry whereText($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseIndustry whereUpdatedAt($value)
 */
	class CourseIndustry extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string $learning_point
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning whereLearningPoint($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseLearning whereUpdatedAt($value)
 */
	class CourseLearning extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $course_id
 * @property string $sprint_name
 * @property int $sprint_number
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MaterialItem> $items
 * @property-read int|null $items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\SprintProgress> $progress
 * @property-read int|null $progress_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereSprintName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereSprintNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseMaterial whereUpdatedAt($value)
 */
	class CourseMaterial extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string|null $entry_level
 * @property string|null $mid_level
 * @property string|null $senior_level
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary whereEntryLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary whereMidLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary whereSeniorLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseSalary whereUpdatedAt($value)
 */
	class CourseSalary extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_id
 * @property string $name
 * @property string|null $icon
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CourseTool whereUpdatedAt($value)
 */
	class CourseTool extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $course_id
 * @property string $category
 * @property string $title
 * @property string|null $description
 * @property string $url
 * @property string $source
 * @property string|null $duration
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereCategory($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereDuration($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ExternalResource whereUrl($value)
 */
	class ExternalResource extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $course_material_id
 * @property string $title
 * @property string $type
 * @property string|null $file_path
 * @property string|null $file_url
 * @property string|null $file_size
 * @property int $order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\CourseMaterial $courseMaterial
 * @property-read mixed $download_url
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\MaterialItemProgress> $progress
 * @property-read int|null $progress_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereCourseMaterialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereFileUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItem whereUpdatedAt($value)
 */
	class MaterialItem extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $material_item_id
 * @property bool $is_completed
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\MaterialItem $materialItem
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress whereIsCompleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress whereMaterialItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MaterialItemProgress whereUserId($value)
 */
	class MaterialItemProgress extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $course_id
 * @property string|null $stripe_session_id
 * @property \Illuminate\Support\Carbon|null $purchased_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase wherePurchasedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase whereStripeSessionId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Purchase whereUserId($value)
 */
	class Purchase extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $referral_code
 * @property int $total_referrals
 * @property int $successful_referrals
 * @property int $pending_referrals
 * @property numeric $total_rewards
 * @property int $current_streak_months
 * @property \Illuminate\Support\Carbon|null $last_referral_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ReferralHistory> $referrals
 * @property-read int|null $referrals_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereCurrentStreakMonths($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereLastReferralAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode wherePendingReferrals($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereReferralCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereSuccessfulReferrals($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereTotalReferrals($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereTotalRewards($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralCode whereUserId($value)
 */
	class ReferralCode extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $referrer_id
 * @property int $referred_user_id
 * @property string $status
 * @property numeric $reward_amount
 * @property \Illuminate\Support\Carbon $referred_at
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $referredUser
 * @property-read \App\Models\User $referrer
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereReferredAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereReferredUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereReferrerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereRewardAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ReferralHistory whereUpdatedAt($value)
 */
	class ReferralHistory extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $course_id
 * @property int $course_material_id
 * @property numeric $progress_percentage
 * @property int $completed_items
 * @property int $total_items
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @property-read \App\Models\CourseMaterial $courseMaterial
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereCompletedItems($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereCourseMaterialId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereProgressPercentage($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereTotalItems($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SprintProgress whereUserId($value)
 */
	class SprintProgress extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $email_verified_at
 * @property string|null $password
 * @property string|null $google_id
 * @property string|null $twofa_secret
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $referred_by_code
 * @property string|null $phone
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Course> $courses
 * @property-read int|null $courses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CourseEnrollment> $enrollments
 * @property-read int|null $enrollments_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Purchase> $purchases
 * @property-read int|null $purchases_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGoogleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereReferredByCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwofaSecret($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 */
	class User extends \Eloquent implements \Tymon\JWTAuth\Contracts\JWTSubject, \Illuminate\Contracts\Auth\MustVerifyEmail {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property int $achievement_badge_id
 * @property \Illuminate\Support\Carbon $unlocked_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\AchievementBadge $badge
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge whereAchievementBadgeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge whereUnlockedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserBadge whereUserId($value)
 */
	class UserBadge extends \Eloquent {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $user_id
 * @property string $course_id
 * @property numeric $overall_progress
 * @property int $total_sprints
 * @property int $completed_sprints
 * @property int $time_spent_minutes
 * @property int $sprints_ahead
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Course $course
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereCompletedSprints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereCourseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereOverallProgress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereSprintsAhead($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereTimeSpentMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereTotalSprints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserCourseStatistic whereUserId($value)
 */
	class UserCourseStatistic extends \Eloquent {}
}

