<?php

namespace App\Mail;

use App\Models\CourseEnrollment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InstallmentPaymentReminder extends Mailable
{
    use Queueable, SerializesModels;

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
}