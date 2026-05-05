<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0f0f0f 0%, #1a1040 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header .emoji { font-size: 48px; margin-bottom: 10px; display: block; }
        .content { padding: 40px 30px; }
        .content p { margin: 0 0 16px 0; font-size: 16px; }
        .info-box { background: #F9FAFB; border-left: 4px solid #4A3AFF; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .info-box h3 { margin: 0 0 16px 0; font-size: 18px; color: #111827; }
        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #E5E7EB; gap: 12px; }
        .info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .info-label { font-weight: 600; color: #6B7280; white-space: nowrap; flex-shrink: 0; }
        .info-value { color: #111827; font-weight: 500; text-align: right; }
        .button { display: inline-block; padding: 14px 32px; background: #4A3AFF; color: white !important; text-decoration: none; border-radius: 40px 12px 40px 12px; font-weight: 700; font-size: 15px; margin: 8px 0; box-shadow: 0 8px 24px rgba(74,58,255,0.3); }
        .button-container { text-align: center; }
        .alert-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 16px; border-radius: 8px; margin: 24px 0; }
        .alert-box p { margin: 0; color: #92400E; font-size: 14px; }
        .access-box { background: #EFF6FF; border-left: 4px solid #3B82F6; padding: 20px; border-radius: 8px; margin: 24px 0; }
        .access-box h3 { margin: 0 0 8px 0; font-size: 17px; color: #1e3a8a; }
        .access-box p { margin: 0; font-size: 14px; color: #1d4ed8; }
        .footer { background: #F9FAFB; padding: 30px; text-align: center; color: #6B7280; font-size: 14px; border-top: 1px solid #E5E7EB; }
        .footer p { margin: 8px 0; }
        .footer a { color: #4A3AFF; text-decoration: none; font-weight: 600; }
        .divider { height: 1px; background: #E5E7EB; margin: 24px 0; }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; border-radius: 0; }
            .header { padding: 30px 20px; }
            .content { padding: 30px 20px; }
            .info-row { flex-direction: column; align-items: flex-start; gap: 4px; }
            .info-value { text-align: left; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="emoji">🎉</span>
            <h1>Congartulations - Payment Confirmed!</h1>
        </div>

        <div class="content">
            <p>Hi <strong>{{ $enrollment->user->name ?? 'there' }}</strong>,</p>

            <p>Your payment for <strong>{{ $enrollment->course_name }}</strong> has been successfully processed. You now have access to your course!</p>

            <div class="info-box">
                <h3>Payment Details</h3>
                <div class="info-row">
                    <span class="info-label">Course:</span>
                    <span class="info-value">{{ $enrollment->course_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Amount Paid:</span>
                    <span class="info-value">
                        {{ $enrollment->currency === 'NGN' ? '₦' : '$' }}{{ number_format($amount ?? $enrollment->amount_paid, 0) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Transaction ID:</span>
                    <span class="info-value" style="font-size:12px; font-family:monospace;">{{ $enrollment->transaction_id }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Learning Track:</span>
                    <span class="info-value">
                        @php
                            $trackNames = [
                                'one_on_one' => 'One-on-One Coaching',
                                'group_mentorship' => 'Group Mentorship',
                                'self_paced' => 'Self-Paced + Community',
                            ];
                        @endphp
                        {{ $trackNames[$enrollment->learning_track] ?? ucwords(str_replace('_', ' ', $enrollment->learning_track)) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Plan:</span>
                    <span class="info-value">{{ $enrollment->payment_type === 'onetime' ? 'One-Time Payment' : 'Installment Plan' }}</span>
                </div>
                @if($enrollment->payment_type === 'installment')
                <div class="info-row">
                    <span class="info-label">Installments:</span>
                    <span class="info-value">{{ $enrollment->installments_paid }} of {{ $enrollment->total_installments }} paid</span>
                </div>
                @if($enrollment->next_payment_due && $enrollment->payment_status !== 'completed')
                <div class="info-row">
                    <span class="info-label">Next Payment Due:</span>
                    <span class="info-value" style="color:#f59e0b; font-weight:700;">
                        {{ \Carbon\Carbon::parse($enrollment->next_payment_due)->format('F j, Y') }}
                    </span>
                </div>
                @endif
                @endif
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">{{ now()->format('F j, Y') }}</span>
                </div>
            </div>

            @if($enrollment->payment_type === 'installment' && $enrollment->payment_status !== 'completed')
            <div class="alert-box">
                <p><strong>⚠️ Reminder:</strong> Please make your next installment by <strong>{{ \Carbon\Carbon::parse($enrollment->next_payment_due)->format('F j, Y') }}</strong> to maintain uninterrupted access to your course.</p>
            </div>
            @endif

            <div class="access-box">
                <h3>✅ You have full access</h3>
                <p>Log in to your dashboard to start learning right away. All course materials are available to you immediately.</p>
            </div>

            <div class="divider"></div>

            <p><strong>What's Next?</strong></p>
            <p>Head to your dashboard to access your course materials, track your progress, and connect with your instructor.</p>

            <div class="button-container">
                <a href="{{ config('app.frontend_url') }}/user/dashboard?tab=your-course" class="button">
                    Go to My Dashboard →
                </a>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #6B7280;">
                Questions? Reach us at
                <a href="mailto:info@learnexity.org" style="color:#4A3AFF; font-weight:600;">info@learnexity.org</a>
            </p>

            <p style="margin-top: 24px;"><strong>Happy learning! 🚀</strong></p>
        </div>

        <div class="footer">
            <p><strong>Learnexity</strong></p>
            <p>© {{ date('Y') }} All rights reserved.</p>
            <p style="margin-top: 16px;">
                <a href="{{ config('app.frontend_url') }}/user/dashboard">Dashboard</a> ·
                <a href="mailto:info@learnexity.org">info@learnexity.org</a>
            </p>
            <p style="margin-top: 12px; font-size: 11px; color: #cbd5e1;">
                Enrollment ID: #{{ $enrollment->id }}
            </p>
        </div>
    </div>
</body>
</html>