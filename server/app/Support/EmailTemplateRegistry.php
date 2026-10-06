<?php

namespace App\Support;

/**
 * Every transactional email an admin can edit in Website CMS → Emails.
 *
 * For each email:
 *  - label / group / description — shown in the admin list
 *  - placeholders — {name} => what it is, plus a sample value for previews
 *  - defaults — subject / heading / body / button used when the admin
 *    turns on "Customise the content" (the starting text in the editor)
 *
 * Without a saved customisation, each email is sent with its original
 * design (resources/views/emails) and subject.
 */
class EmailTemplateRegistry
{
    /** @return array<string, array{label:string, group:string, description:string, placeholders:array<string,array{0:string,1:string}>, defaults:array{subject:string,heading:string,body:string,button:string}}> */
    public static function all(): array
    {
        $student = 'Students';
        $payments = 'Payments';
        $scholarship = 'Scholarships';
        $admin = 'Admin team';
        $other = 'Other';

        return [
            // ── Accounts ────────────────────────────────────────────────
            'welcome' => [
                'label' => 'Welcome email', 'group' => $student,
                'description' => 'Sent right after a student verifies their account.',
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada']],
                'defaults' => [
                    'subject' => "🎉 Welcome to Learnexity — You're In!",
                    'heading' => "You're officially in!",
                    'body' => "Hey {first_name},\n\nWelcome to Learnexity — your account is verified and your learning journey starts right now. Learnexity was built for people exactly like you: driven, curious, and ready to build real skills that open real doors.\n\nBrowse our courses, pick the track that fits your goals, choose a payment plan and start learning immediately.",
                    'button' => 'Explore Courses',
                ],
            ],
            'registration_otp' => [
                'label' => 'Email verification code', 'group' => $student,
                'description' => 'One-time code sent during sign-up.',
                'placeholders' => ['code' => ['Verification code', '482913']],
                'defaults' => [
                    'subject' => 'Your Learnexity verification code',
                    'heading' => 'Verify your email',
                    'body' => "Use this code to complete your Learnexity registration:\n\n**{code}**\n\nThis code expires in 10 minutes. If you didn't request this, you can ignore this email.",
                    'button' => '',
                ],
            ],
            'login_welcome_back' => [
                'label' => 'Welcome back (login)', 'group' => $student,
                'description' => 'Sent when a student logs in again.',
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'streak' => ['Login streak (days)', '3']],
                'defaults' => [
                    'subject' => 'Welcome back, {first_name}!',
                    'heading' => 'Welcome Back!',
                    'body' => "Hey {first_name},\n\nGood to see you again on Learnexity. Pick up right where you left off.",
                    'button' => 'Continue Learning',
                ],
            ],
            'daily_checkin' => [
                'label' => 'Daily learning check-in', 'group' => $student,
                'description' => 'Daily progress snapshot for enrolled students.',
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'streak' => ['Login streak (days)', '5']],
                'defaults' => [
                    'subject' => '📚 Your Daily Learning Check-in — {name}',
                    'heading' => 'Daily Learning Check-in',
                    'body' => "Good morning, {first_name}!\n\nHere's a snapshot of where you stand today. A little progress each day adds up to something big.\n\nConsistency is the secret — even 20 minutes today keeps you ahead of the curve.",
                    'button' => 'Go to My Dashboard',
                ],
            ],
            'inactive_user' => [
                'label' => 'Inactive student reminder', 'group' => $student,
                'description' => "Sent when a student hasn't logged in for a while.",
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'days' => ['Days inactive', '7']],
                'defaults' => [
                    'subject' => 'We miss you, {first_name} — come back and keep learning 👋',
                    'heading' => 'Your courses are ready when you are',
                    'body' => "Hey {first_name},\n\nIt's been {days} days since your last login. Your progress is still here, waiting for you — pick up where you left off.",
                    'button' => 'Continue Learning',
                ],
            ],
            'unenrolled_nudge' => [
                'label' => 'Not-yet-enrolled reminder', 'group' => $student,
                'description' => "Sent to students who signed up but haven't enrolled in a course.",
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada']],
                'defaults' => [
                    'subject' => 'Ready to start building, {first_name}?',
                    'heading' => 'Ready to start building?',
                    'body' => "Hi {first_name},\n\nYou created your Learnexity account — that's the first step. But you haven't enrolled in a course yet, and we'd love to change that.",
                    'button' => 'Browse Courses',
                ],
            ],
            'sprint_completed' => [
                'label' => 'Sprint completed', 'group' => $student,
                'description' => 'Sent when a student finishes a sprint.',
                'placeholders' => [
                    'name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation'],
                    'sprint_number' => ['Sprint number', '2'], 'sprint_name' => ['Sprint name', 'Building your first agent'],
                    'progress' => ['Course progress %', '40'], 'total_sprints' => ['Total sprints', '6'],
                ],
                'defaults' => [
                    'subject' => 'Sprint {sprint_number} Complete — Great work, {name}!',
                    'heading' => 'Sprint {sprint_number} Complete!',
                    'body' => "Excellent work, {first_name}! 🎉\n\nYou've just completed **{sprint_name}** in {course}. You're now {progress}% through the course — keep that momentum going!",
                    'button' => 'Continue Learning',
                ],
            ],
            'performance' => [
                'label' => 'Performance update', 'group' => $student,
                'description' => 'Progress / streak / quality notes from the learning engine.',
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation'], 'message' => ['Personalised message', "You're moving faster than 80% of learners this week."]],
                'defaults' => [
                    'subject' => 'A note about your learning progress',
                    'heading' => 'Performance Update',
                    'body' => "Hi {first_name},\n\n{message}",
                    'button' => 'Open My Dashboard',
                ],
            ],

            'course_access_granted' => [
                'label' => 'Course access granted', 'group' => $student,
                'description' => 'Sent when an admin grants a student access to a course.',
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation']],
                'defaults' => [
                    'subject' => '🎉 You now have access to {course}',
                    'heading' => 'Your course is unlocked!',
                    'body' => "Hi {first_name},\n\nGood news — you now have full access to **{course}**. All the course materials are ready for you, so you can start learning right away.",
                    'button' => 'Start Learning',
                ],
            ],

            // ── Payments ────────────────────────────────────────────────
            'payment_confirmation' => [
                'label' => 'Payment confirmation', 'group' => $payments,
                'description' => 'Sent after a successful course payment.',
                'placeholders' => [
                    'name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation'],
                    'amount' => ['Amount paid', '$250'], 'transaction_id' => ['Transaction ID', 'PSK_123456'],
                ],
                'defaults' => [
                    'subject' => 'Payment Confirmation - {course}',
                    'heading' => 'Congratulations - Payment Confirmed!',
                    'body' => "Hi {first_name},\n\nYour payment of **{amount}** for **{course}** has been successfully processed. You now have access to your course!",
                    'button' => 'Go to My Course',
                ],
            ],
            'installment_reminder' => [
                'label' => 'Installment reminder', 'group' => $payments,
                'description' => 'Before (and after) an installment is due.',
                'placeholders' => [
                    'name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation'],
                    'amount' => ['Amount due', '$120'], 'due_date' => ['Due date', 'March 3, 2027'],
                    'installment' => ['Installment number', '2'], 'total_installments' => ['Total installments', '4'],
                ],
                'defaults' => [
                    'subject' => '📅 Payment Reminder - {course}',
                    'heading' => 'Payment Reminder',
                    'body' => "Hi {first_name},\n\nThis is a friendly reminder that installment {installment} of {total_installments} for **{course}** (**{amount}**) is due on {due_date}.",
                    'button' => 'Make Payment',
                ],
            ],
            'pending_payment_nudge' => [
                'label' => 'Unfinished payment reminder', 'group' => $payments,
                'description' => 'Sent when an enrollment is waiting for payment.',
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation'], 'amount' => ['Amount due', '$250']],
                'defaults' => [
                    'subject' => 'Complete your enrollment in {course}',
                    'heading' => 'Your spot is waiting',
                    'body' => "Hi {first_name},\n\nYou started the enrollment process for **{course}** but haven't completed payment yet. Your spot is reserved — finish now and start learning today.",
                    'button' => 'Complete Payment',
                ],
            ],

            // ── Scholarships ────────────────────────────────────────────
            'scholarship_result' => [
                'label' => 'Scholarship awarded', 'group' => $scholarship,
                'description' => 'Sent the moment a scholarship is awarded.',
                'placeholders' => [
                    'name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation'],
                    'fee' => ['Registration fee', '₦25,000.00'],
                ],
                'defaults' => [
                    'subject' => "🎓 You've been awarded a scholarship — {course}",
                    'heading' => 'Scholarship Awarded!',
                    'body' => "Hi {first_name},\n\nCongratulations! You've been awarded a **scholarship** for **{course}**. You only need to pay the registration fee of **{fee}** to secure your spot — your tuition is covered.",
                    'button' => 'Proceed to Payment',
                ],
            ],
            'scholarship_countdown' => [
                'label' => 'Scholarship expiry reminder', 'group' => $scholarship,
                'description' => "Reminds a student their scholarship hasn't been used yet.",
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'first_name' => ['First name', 'Ada'], 'course' => ['Course', 'AI Automation'], 'days' => ['Days left', '7']],
                'defaults' => [
                    'subject' => 'Reminder: {days} days left to use your scholarship',
                    'heading' => "Don't lose your scholarship spot",
                    'body' => "Hi {first_name},\n\nJust a friendly reminder that your scholarship for **{course}** is still waiting to be used. You have **{days} days** left — pay the registration fee to keep your spot.",
                    'button' => 'Complete Your Enrollment',
                ],
            ],

            // ── Refer & Earn ────────────────────────────────────────────
            'payout_approved' => [
                'label' => 'Payout sent', 'group' => 'Refer & Earn',
                'description' => 'Sent when an admin approves a payout request.',
                'placeholders' => ['amount' => ['Amount', '₦12,500.00'], 'bank' => ['Bank details', 'GTBank · 0123456789']],
                'defaults' => [
                    'subject' => 'Your Learnexity payout has been sent',
                    'heading' => '💸 Payout Sent',
                    'body' => "Good news — your Refer & Earn payout of **{amount}** has been sent to {bank}.\n\nThis was sent as a manual bank transfer, so it may take a little time to reflect depending on your bank. Keep sharing your referral link to keep earning!",
                    'button' => '',
                ],
            ],
            'payout_declined' => [
                'label' => 'Payout declined', 'group' => 'Refer & Earn',
                'description' => 'Sent when an admin declines a payout request.',
                'placeholders' => ['amount' => ['Amount', '₦12,500.00'], 'note' => ['Admin note', 'The account name did not match.']],
                'defaults' => [
                    'subject' => 'Update on your Learnexity payout request',
                    'heading' => 'Payout Request Update',
                    'body' => "We weren't able to process your payout request for **{amount}** this time.\n\n{note}\n\nYour earned balance hasn't been affected — you can update your bank details and submit a new payout request any time from your Refer & Earn dashboard.",
                    'button' => '',
                ],
            ],

            // ── Admin team ──────────────────────────────────────────────
            'admin_new_student' => [
                'label' => 'New student / enrollment (admin)', 'group' => $admin,
                'description' => 'Notifies the admin team about a new student or enrollment.',
                'placeholders' => ['name' => ['Student name', 'Ada Obi'], 'email' => ['Student email', 'ada@example.com'], 'course' => ['Course (if any)', 'AI Automation']],
                'defaults' => [
                    'subject' => 'New student: {name}',
                    'heading' => 'New Student Registered',
                    'body' => "{name} ({email}) just joined Learnexity.\n\nCourse: {course}",
                    'button' => '',
                ],
            ],
            'admin_payout_requested' => [
                'label' => 'Payout requested (admin)', 'group' => $admin,
                'description' => 'Notifies the admin team about a new payout request.',
                'placeholders' => [
                    'amount' => ['Amount', '₦12,500.00'], 'payee' => ['Referrer', 'Ada Obi'], 'bank' => ['Bank', 'GTBank'],
                    'account_number' => ['Account number', '0123456789'], 'account_name' => ['Account name', 'Ada Obi'],
                ],
                'defaults' => [
                    'subject' => 'Payout Requested - {amount} - {payee}',
                    'heading' => 'New Payout Request',
                    'body' => "{payee} has requested a payout of **{amount}**.\n\nBank: {bank} · {account_number} ({account_name})\n\nReview it in the admin dashboard under Referrals → Payout Requests.",
                    'button' => '',
                ],
            ],
            'consultation_booked_admin' => [
                'label' => 'Consultation booked (admin)', 'group' => $admin,
                'description' => 'Notifies the admin team about a new consultation booking.',
                'placeholders' => ['name' => ['Name', 'Ada Obi'], 'email' => ['Email', 'ada@example.com'], 'type' => ['Consultation type', 'Career Advice'], 'date' => ['Preferred date', 'March 3, 2027'], 'time' => ['Preferred time', '10:00 AM']],
                'defaults' => [
                    'subject' => 'New consultation booking: {name}',
                    'heading' => 'New Consultation Booking Received',
                    'body' => "A new consultation has been booked by {name} ({email}).\n\nType: {type}\nDate: {date} at {time}",
                    'button' => '',
                ],
            ],

            // ── Other ───────────────────────────────────────────────────
            'consultation_confirmation' => [
                'label' => 'Consultation confirmation', 'group' => $other,
                'description' => 'Sent to whoever books a consultation.',
                'placeholders' => ['name' => ['Name', 'Ada Obi'], 'type' => ['Consultation type', 'Career Advice'], 'date' => ['Date', 'March 3, 2027'], 'time' => ['Time', '10:00 AM']],
                'defaults' => [
                    'subject' => 'Your consultation is confirmed',
                    'heading' => 'Your Consultation is Confirmed!',
                    'body' => "Hi {name}, we've received your booking.\n\nType: {type}\nDate: {date} at {time}",
                    'button' => '',
                ],
            ],
            'instructor_welcome' => [
                'label' => 'Instructor welcome / password reset', 'group' => $other,
                'description' => 'Login details for a new instructor (or a reset password).',
                'placeholders' => ['name' => ['Instructor name', 'Chika Eze'], 'email' => ['Login email', 'chika@example.com'], 'password' => ['Password', 'Temp#2026'], 'login_url' => ['Login URL', 'https://learnexity.org/instructors/auth/login']],
                'defaults' => [
                    'subject' => 'Welcome to Learnexity — your instructor account',
                    'heading' => 'Welcome, Instructor!',
                    'body' => "Hi {name},\n\nYou've been added as an instructor on Learnexity. Your account is ready — use these credentials to log in:\n\nEmail: **{email}**\nPassword: **{password}**\n\nPlease change your password after your first login. Do not share these credentials with anyone.",
                    'button' => 'Log In to Instructor Portal',
                ],
            ],
            'kids_registration' => [
                'label' => 'Kids programme registration', 'group' => 'Kids',
                'description' => 'Sent to the parent after registering a child.',
                'placeholders' => ['parent_name' => ['Parent name', 'Ngozi Obi'], 'student_name' => ['Child name', 'Tobi'], 'course' => ['Course', 'Media Creator'], 'total' => ['Total', '₦150,000']],
                'defaults' => [
                    'subject' => "You're registered! Here's how to complete your enrollment — Learnexity Kids",
                    'heading' => 'Registration Confirmed!',
                    'body' => "Hi {parent_name}, great news — {student_name}'s enrollment in **{course}** has been registered.\n\nYour spot is reserved, but please complete payment within 48 hours to confirm it.",
                    'button' => 'Complete Payment',
                ],
            ],
            'kids_enrollment_confirmation' => [
                'label' => 'Kids programme payment received', 'group' => 'Kids',
                'description' => 'Sent to the parent after a kids programme payment.',
                'placeholders' => ['parent_name' => ['Parent name', 'Ngozi Obi'], 'student_name' => ['Child name', 'Tobi'], 'course' => ['Course', 'Media Creator'], 'amount' => ['Amount paid', '₦50,000.00']],
                'defaults' => [
                    'subject' => 'Payment received — Learnexity Kids',
                    'heading' => 'Payment received!',
                    'body' => "Hi {parent_name}, thank you for enrolling {student_name} in the Learnexity Kids Programme.\n\nWe've received your payment of **{amount}** for **{course}**.",
                    'button' => '',
                ],
            ],
        ];
    }

    public static function get(string $key): ?array
    {
        return self::all()[$key] ?? null;
    }

    /** Sample values for previews / test sends. */
    public static function sampleVars(string $key): array
    {
        $def = self::get($key);
        $vars = [];
        foreach ($def['placeholders'] ?? [] as $name => [, $sample]) {
            $vars[$name] = $sample;
        }
        return $vars;
    }
}
