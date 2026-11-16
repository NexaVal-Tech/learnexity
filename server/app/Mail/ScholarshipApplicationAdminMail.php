<?php

namespace App\Mail;

use App\Models\Scholarship;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** Tells the admin team a new scholarship application is waiting for review. */
class ScholarshipApplicationAdminMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public User $user, public Scholarship $scholarship) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'New scholarship application: ' . $this->user->name . ' — ' . $this->scholarship->course_name);
    }

    public function content(): Content
    {
        $site = rtrim((string) config('app.frontend_url', 'https://learnexity.org'), '/');
        $a = (array) ($this->scholarship->answers ?? []);
        $label = [
            '1_3' => '1–3 hrs/week', '4_6' => '4–6 hrs/week', '7_10' => '7–10 hrs/week', '10_plus' => '10+ hrs/week',
            'under_100' => 'Under ₦100k / $100 per month', '100_200' => '₦100k–₦200k / $100–$200 per month',
            'above_200' => 'Above ₦200k / $200 per month', 'not_employed' => 'Not employed', 'yes' => 'Yes', 'no' => 'No',
        ];
        $pick = fn ($k) => isset($a[$k]) ? ($label[$a[$k]] ?? $a[$k]) : '—';

        return new Content(view: 'emails.admin.scholarship_application', with: [
            'name'      => $this->user->name,
            'email'     => $this->user->email,
            'course'    => $this->scholarship->course_name,
            'details'   => [
                'Hours per week' => $pick('weekly_hours'),
                'Student'        => $pick('is_student'),
                'Employed'       => $pick('is_employed'),
                'Monthly income' => $pick('salary_range'),
                'Current location (they chose)'   => $a['current_location'] ?? ($a['country'] ?? '—'),
                'Location from their connection'  => $a['detected_location'] ?? 'Not detected',
            ],
            'why'       => (string) ($a['why_scholarship'] ?? ''),
            'goal'      => (string) ($a['long_term_goal'] ?? ''),
            'reviewUrl' => $site . '/admin/scholarship-application',
            'siteUrl'   => $site,
        ]);
    }
}
