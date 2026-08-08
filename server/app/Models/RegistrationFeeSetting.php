<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationFeeSetting extends Model
{
    protected $table = 'registration_fee_settings';

    protected $fillable = [
        'price_usd',
        'price_ngn',
        'deeptech_price_usd',
        'deeptech_price_ngn',
        'flexible_price_usd',
        'flexible_price_ngn',
        'partial_scholarship_percentage',
        'intermediate_price_usd',
        'intermediate_price_ngn',
    ];

    public const CATEGORY_DEEPTECH     = 'deeptech';
    public const CATEGORY_FLEXIBLE     = 'flexible';
    public const CATEGORY_INTERMEDIATE = 'intermediate';

    /**
     * This is a single-row settings table (created by the migration).
     * Always use this instead of ::first() directly so the app never
     * has to worry about the row missing.
     */
    public static function current(): self
    {
        return static::query()->first() ?? static::create(['price_usd' => 0, 'price_ngn' => 0]);
    }

    /**
     * Which category a learning track belongs to for registration-fee
     * purposes. one_on_one/group_mentorship are the "Deep-Tech" tracks
     * (see Courses.tsx); self_paced is "Flexible". A course can offer more
     * than one track, so this is decided per-enrollment by the track the
     * student actually picked, not by a fixed label on the course itself.
     *
     * @deprecated Prefer categoryForCourseAndTrack(), which also honours a
     * course's admin-assigned fee_category override (e.g. "Intermediate").
     * Kept for any caller that only has a track and no course in scope.
     */
    public static function categoryForTrack(?string $learningTrack): string
    {
        return in_array($learningTrack, ['one_on_one', 'group_mentorship'], true)
            ? self::CATEGORY_DEEPTECH
            : self::CATEGORY_FLEXIBLE;
    }

    /**
     * Same as categoryForTrack(), but a course explicitly moved into a
     * category by the admin (Course::fee_category — e.g. "Intermediate",
     * for courses that don't cleanly fit Deep-Tech or Flexible) always
     * wins over the automatic track-based derivation.
     */
    public static function categoryForCourseAndTrack(?Course $course, ?string $learningTrack): string
    {
        if ($course && $course->fee_category) {
            return $course->fee_category;
        }

        return self::categoryForTrack($learningTrack);
    }

    /**
     * @deprecated Use priceForCategory() — kept only so nothing that still
     * calls this (if anything) breaks; it now just returns the flexible
     * tier's price as a reasonable default.
     */
    public function priceForCurrency(string $currency): float
    {
        return $this->priceForCategory(self::CATEGORY_FLEXIBLE, $currency);
    }

    public function priceForCategory(string $category, string $currency): float
    {
        $isNgn = strtoupper($currency) === 'NGN';

        if ($category === self::CATEGORY_DEEPTECH) {
            return $isNgn ? (float) $this->deeptech_price_ngn : (float) $this->deeptech_price_usd;
        }

        if ($category === self::CATEGORY_INTERMEDIATE) {
            return $isNgn ? (float) $this->intermediate_price_ngn : (float) $this->intermediate_price_usd;
        }

        return $isNgn ? (float) $this->flexible_price_ngn : (float) $this->flexible_price_usd;
    }

    /**
     * The scholarship percentage awarded to applicants who don't qualify
     * for full tuition. Admin-configurable (Course Settings page); there's
     * no more 0%/rejected outcome, so this is always the floor everyone
     * gets. Falls back to 50 if unset (e.g. row predates this column).
     */
    public function getPartialScholarshipPercentageValue(): float
    {
        $value = (float) $this->partial_scholarship_percentage;

        return $value > 0 ? $value : 50.0;
    }
}