<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class CourseEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'course_id',
        'course_name',
        'course_price',
        'learning_track',
        // Payment
        'payment_type',
        'currency',
        'total_amount',
        'amount_paid',
        'total_installments',
        'installments_paid',
        'installment_amount',
        'payment_status',

        // Access
        'has_access',
        'next_payment_due',

        // Meta
        'transaction_id',
        'enrollment_date',
        'payment_date',
        'last_installment_paid_at',
        'access_blocked_reason',
        'last_reminder_sent_at',
    ];

    protected $casts = [
       'total_amount' => 'decimal:2',
        'amount_paid' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'has_access' => 'boolean',
        'next_payment_due' => 'datetime',
        'enrollment_date' => 'datetime',
        'payment_date' => 'datetime',
        'last_installment_paid_at' => 'datetime',
        'last_reminder_sent_at' => 'datetime',
    ];

    protected $appends = ['payment_overdue', 'days_overdue', 'access_blocked_reason'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ✅ ADD THIS - Course relationship
    public function course()
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }

    public function isPaymentCompleted()
    {
        return $this->payment_status === 'completed';
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('payment_status', 'pending');
    }
    public function getLearningTrackNameAttribute(): string
    {
        return match($this->learning_track) {
            'one_on_one' => 'One-on-One Coaching',
            'group_mentorship' => 'Group Mentorship Program',
            'self_paced' => 'Self-Paced Learning + Community Support',
            default => 'Self-Paced Learning',
        };
    }
    public function installmentPayments()
    {
        return $this->hasMany(InstallmentPayment::class, 'enrollment_id');
    }

    /**
     * Determine if user can access course
     */
    public function canAccess(): bool
    {
        if ($this->payment_type === 'onetime') {
            return $this->payment_status === 'completed';
        }

        // Installment logic
        return $this->has_access && $this->next_payment_due?->isFuture();
    }

    /**
     * Mark installment as paid
     */
    public function registerInstallment(float $amount): void
    {
        $this->amount_paid += $amount;
        $this->installments_paid += 1;
        $this->last_installment_paid_at = now();

        if ($this->installments_paid >= $this->total_installments) {
            $this->payment_status = 'completed';
            $this->has_access = true;
            $this->next_payment_due = null;
        } else {
            $this->has_access = true;
            $this->next_payment_due = now()->addWeeks(4);
        }

        $this->save();
    }

        /**
     * Check if payment is overdue
     */
    public function getPaymentOverdueAttribute(): bool
    {
        if ($this->payment_type !== 'installment') {
            return false;
        }

        if ($this->payment_status === 'completed') {
            return false;
        }

        if (!$this->next_payment_due) {
            return false;
        }

        return Carbon::now()->isAfter($this->next_payment_due);
    }

    /**
     * Get days overdue
     */
    public function getDaysOverdueAttribute(): int
    {
        if (!$this->payment_overdue) {
            return 0;
        }

        return Carbon::now()->diffInDays($this->next_payment_due);
    }

    /**
     * Get access blocked reason
     */
    public function getAccessBlockedReasonAttribute(): ?string
    {
        if ($this->has_access) {
            return null;
        }

        if ($this->payment_status === 'pending' && $this->amount_paid == 0) {
            return 'Please complete your payment to access this course.';
        }

        if ($this->payment_overdue) {
            return "Your payment is overdue by {$this->days_overdue} days. Please make your payment to continue accessing the course.";
        }

        return 'Payment required to access course materials.';
    }

    /**
     * Update access status based on payment
     */
    public function updateAccessStatus()
    {
        // Skip if not installment payment
        if ($this->payment_type !== 'installment') {
            return;
        }

        // Skip if payment is already completed
        if ($this->payment_status === 'completed') {
            $this->has_access = true;
            $this->access_blocked_reason = null;
            $this->save();
            return;
        }

        // Check if payment is overdue
        if ($this->next_payment_due && Carbon::now()->isAfter($this->next_payment_due)) {
            $daysOverdue = Carbon::now()->diffInDays($this->next_payment_due);
            
            // Block access after 7 days grace period
            if ($daysOverdue > 7) {
                $this->has_access = false;
                $this->access_blocked_reason = "Your installment payment is overdue by {$daysOverdue} days. Please complete your payment to regain access.";
                $this->save();
            } else {
                // Still have access but show warning
                $this->has_access = true;
                $this->access_blocked_reason = "Payment due soon! You have " . (7 - $daysOverdue) . " days remaining before access is suspended.";
                $this->save();
            }
        } else {
            // Payment is not overdue, ensure access
            $this->has_access = true;
            $this->access_blocked_reason = null;
            $this->save();
        }
    }

        /**
     * Check if payment is overdue
     */
    public function isPaymentOverdue(): bool
    {
        if ($this->payment_type !== 'installment' || $this->payment_status === 'completed') {
            return false;
        }

        return $this->next_payment_due && Carbon::now()->isAfter($this->next_payment_due);
    }

        /**
     * Get days until next payment or days overdue
     */
    public function getDaysUntilPayment(): int
    {
        if (!$this->next_payment_due) {
            return 0;
        }

        return Carbon::now()->diffInDays($this->next_payment_due, false);
    }

    /**
     * Determine if user should have access
     */
    private function shouldHaveAccess(): bool
    {
        // One-time payment: must be completed
        if ($this->payment_type === 'onetime') {
            return $this->payment_status === 'completed';
        }

        // Installment: must have made at least first payment and not be overdue
        if ($this->payment_type === 'installment') {
            // All installments paid
            if ($this->installments_paid >= $this->total_installments) {
                return true;
            }

            // At least one payment made and not overdue
            if ($this->installments_paid > 0 && !$this->payment_overdue) {
                return true;
            }

            return false;
        }

        return false;
    }

}