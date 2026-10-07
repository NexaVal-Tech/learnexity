<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;
use App\Models\MaterialItemSubmission;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Sent when an admin/instructor reviews a student's sprint task.
 * Text editable in Website CMS → Emails.
 */
class TaskReviewedMail extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public function __construct(
        public User $user,
        public MaterialItemSubmission $submission,
    ) {}

    private function taskTitle(): string
    {
        return (string) optional($this->submission->item)->title ?: 'your task';
    }

    private function statusLabel(): string
    {
        return match ($this->submission->status) {
            MaterialItemSubmission::STATUS_PASSED         => 'Passed',
            MaterialItemSubmission::STATUS_NEEDS_REVISION => 'Needs revision — please resubmit',
            MaterialItemSubmission::STATUS_GRADED         => 'Graded',
            default                                       => 'Reviewed',
        };
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->templatedSubject("Your task \"{$this->taskTitle()}\" has been reviewed"));
    }

    public function content(): Content
    {
        return $this->templatedContent(new Content(
            view: 'emails.student.task_reviewed',
            with: [
                'user'      => $this->user,
                'taskTitle' => $this->taskTitle(),
                'status'    => $this->statusLabel(),
                'score'     => $this->submission->score,
                'feedback'  => $this->submission->feedback,
                'url'       => $this->emailTemplateButtonUrl(),
            ],
        ));
    }

    protected function emailTemplateKey(): string
    {
        return 'task_reviewed';
    }

    protected function emailTemplateVars(): array
    {
        return [
            'name'       => $this->user->name,
            'first_name' => explode(' ', trim((string) $this->user->name))[0],
            'task'       => $this->taskTitle(),
            'status'     => $this->statusLabel(),
            'score'      => $this->submission->score !== null ? rtrim(rtrim(number_format((float) $this->submission->score, 2), '0'), '.') . '%' : '—',
            'feedback'   => (string) ($this->submission->feedback ?? ''),
        ];
    }

    protected function emailTemplateDetails(): array
    {
        return array_filter([
            'Task'   => $this->taskTitle(),
            'Result' => $this->statusLabel(),
            'Score'  => $this->emailTemplateVars()['score'],
        ]);
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')), '/')
            . '/user/resource?courseId=' . urlencode((string) $this->submission->course_id);
    }
}
