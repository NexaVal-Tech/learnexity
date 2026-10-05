<?php

namespace App\Mail;

use App\Mail\Concerns\UsesEmailTemplate;

use App\Models\CourseEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InstallmentPaymentReminder extends Mailable
{
    use Queueable, SerializesModels, UsesEmailTemplate;

    public $enrollment;
    public $daysUntilDue;
    public $isOverdue;

    public function __construct(CourseEnrollment $enrollment)
    {
        $this->enrollment = $enrollment;
        $this->daysUntilDue = $enrollment->getDaysUntilPayment();
        $this->isOverdue = $enrollment->isPaymentOverdue();
    }

    public function build()
    {
        $subject = $this->isOverdue 
            ? "⚠️ Overdue Payment - {$this->enrollment->course_name}"
            : "📅 Payment Reminder - {$this->enrollment->course_name}";

        $subject = $this->templatedSubject($subject);

        if ($this->hasCustomEmailBody()) {
            return $this->subject($subject)->view('emails.cms_template')->with($this->customEmailViewData());
        }

        return $this->subject($subject)
                    ->view('emails.installment-reminder')
                    ->with([
                        'courseName' => $this->enrollment->course_name,
                        'installmentNumber' => $this->enrollment->installments_paid + 1,
                        'totalInstallments' => $this->enrollment->total_installments,
                        'amount' => $this->enrollment->installment_amount,
                        'currency' => $this->enrollment->currency,
                        'dueDate' => $this->enrollment->next_payment_due,
                        'daysUntilDue' => abs($this->daysUntilDue),
                        'isOverdue' => $this->isOverdue,
                        'paymentUrl' => config('app.frontend_url') . '/user/payment/' . $this->enrollment->id,
                    ]);
    }

    // ── Website CMS → Emails ────────────────────────────────────────────
    protected function emailTemplateKey(): string
    {
        return 'installment_reminder';
    }

    protected function emailTemplateVars(): array
    {
        $name = (string) ($this->enrollment->user->name ?? 'there');
        $sym  = strtoupper((string) $this->enrollment->currency) === 'NGN' ? '₦' : '$';
        return [
            'name' => $name,
            'first_name' => explode(' ', trim($name))[0],
            'course' => $this->enrollment->course_name,
            'amount' => $sym . number_format((float) $this->enrollment->installment_amount, 2),
            'due_date' => optional($this->enrollment->next_payment_due)->format('F j, Y') ?? '',
            'installment' => $this->enrollment->installments_paid + 1,
            'total_installments' => $this->enrollment->total_installments,
        ];
    }

    protected function emailTemplateButtonUrl(): ?string
    {
        return config('app.frontend_url') . '/user/payment/' . $this->enrollment->id;
    }
}
