<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1040 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .header .emoji {
            font-size: 48px;
            margin-bottom: 10px;
            display: block;
        }
        .content {
            padding: 40px 30px;
        }
        .content p {
            margin: 0 0 16px 0;
            font-size: 16px;
        }
        .info-box {
            background: #F9FAFB;
            border-left: 4px solid #4A3AFF;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .info-box h3 {
            margin: 0 0 16px 0;
            font-size: 18px;
            color: #111827;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #E5E7EB;
            gap: 12px;
        }
        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .info-label {
            font-weight: 600;
            color: #6B7280;
            white-space: nowrap;
            flex-shrink: 0;
        }
        .info-value {
            color: #111827;
            font-weight: 500;
            text-align: right;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: #4A3AFF;
            color: white !important;
            text-decoration: none;
            border-radius: 40px 12px 40px 12px;
            font-weight: 700;
            font-size: 15px;
            margin: 8px 0;
            box-shadow: 0 8px 24px rgba(74,58,255,0.3);
        }
        .button-whatsapp {
            display: inline-block;
            padding: 14px 32px;
            background: #25D366;
            color: white !important;
            text-decoration: none;
            border-radius: 40px 12px 40px 12px;
            font-weight: 700;
            font-size: 15px;
            margin: 8px 0;
            box-shadow: 0 8px 24px rgba(37,211,102,0.3);
        }
        .button-container {
            text-align: center;
        }
        .whatsapp-box {
            background: #F0FDF4;
            border: 1px solid #bbf7d0;
            border-left: 4px solid #25D366;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
            text-align: center;
        }
        .whatsapp-box h3 {
            margin: 0 0 8px 0;
            font-size: 17px;
            color: #14532d;
        }
        .whatsapp-box p {
            margin: 0 0 16px 0;
            font-size: 14px;
            color: #166534;
        }
        .alert-box {
            background: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .alert-box p {
            margin: 0;
            color: #92400E;
            font-size: 14px;
        }
        .footer {
            background: #F9FAFB;
            padding: 30px;
            text-align: center;
            color: #6B7280;
            font-size: 14px;
            border-top: 1px solid #E5E7EB;
        }
        .footer p {
            margin: 8px 0;
        }
        .footer a {
            color: #4A3AFF;
            text-decoration: none;
            font-weight: 600;
        }
        .divider {
            height: 1px;
            background: #E5E7EB;
            margin: 24px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header {
                padding: 30px 20px;
            }
            .content {
                padding: 30px 20px;
            }
            .info-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }
            .info-value {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="emoji">🎉</span>
            <h1>Payment Confirmed!</h1>
        </div>

        <div class="content">
            <p>Hi <strong>{{ $enrollment->parent_name }}</strong>,</p>

            <p>Great news! Your payment for <strong>{{ $enrollment->course?->name ?? 'Learnexity Kids Programme' }}</strong> has been successfully processed. <strong>{{ $enrollment->student_name }}</strong> is now officially enrolled!</p>

            <div class="info-box">
                <h3>Payment Details</h3>
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
                    <span class="info-label">Track:</span>
                    <span class="info-value">{{ ucwords(str_replace('_', ' ', $enrollment->chosen_track)) }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Session Format:</span>
                    <span class="info-value">
                        {{ $enrollment->session_type === 'one_on_one' ? 'One-on-One Coaching' : 'Group Mentorship (3–5 kids)' }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Plan:</span>
                    <span class="info-value">
                        {{ $enrollment->payment_type === 'onetime' ? 'Pay in Full' : '3 Monthly Payments' }}
                    </span>
                </div>
                @if($enrollment->payment_type === 'installment')
                <div class="info-row">
                    <span class="info-label">Progress:</span>
                    <span class="info-value">
                        {{ $enrollment->installments_paid }} of {{ $enrollment->total_installments }} paid
                    </span>
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
            </div>

            @if($enrollment->payment_type === 'installment' && $enrollment->payment_status !== 'completed')
            <div class="alert-box">
                <p><strong>⚠️ Reminder:</strong> Please ensure your next installment is made by <strong>{{ \Carbon\Carbon::parse($enrollment->next_payment_due)->format('F j, Y') }}</strong> to keep {{ $enrollment->student_name }}'s access uninterrupted.</p>
            </div>
            @endif

            <div class="divider"></div>

            <!-- WhatsApp Community Box -->
            <div class="whatsapp-box">
                <h3>💬 Join Our Parent Community</h3>
                <p>
                    Stay connected with schedules, session reminders, progress updates, and announcements for {{ $enrollment->student_name }}'s cohort. All parents are encouraged to join.
                </p>
                <a href="https://chat.whatsapp.com/KJntcErzERgBOfQqECkHCI?mode=gi_t" class="button-whatsapp">
                    Join WhatsApp Group 
                </a>
            </div>

            <div class="divider"></div>

            <p><strong>What's Next?</strong></p>
            <p>
                @if($isComplete ?? true)
                    {{ $enrollment->student_name }}'s enrollment is fully confirmed. Our team will reach out within <strong>24 hours</strong> to schedule the first session.
                @else
                    {{ $enrollment->student_name }} now has access to course materials. Keep up with installment payments to maintain uninterrupted access.
                @endif
            </p>

            <div class="button-container">
                <a href="{{ config('app.frontend_url') }}/kids" class="button">
                    Back to Learnexity Kids →
                </a>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #6B7280;">
                Questions? Reply to this email or reach us at
                <a href="mailto:info@learnexity.org" style="color:#4A3AFF; font-weight:600;">info@learnexity.org</a>.
            </p>

            <p style="margin-top: 24px;">
                <strong>Happy learning! 🚀</strong>
            </p>
        </div>

        <div class="footer">
            <p><strong>Learnexity · Kids Digital Skills Programme</strong></p>
            <p>© {{ date('Y') }} All rights reserved.</p>
            <p style="margin-top: 16px;">
                <a href="{{ config('app.frontend_url') }}/kids">Kids Programme</a> ·
                <a href="mailto:info@learnexity.org">info@learnexity.org</a>
            </p>
            <p style="margin-top: 12px; font-size: 11px; color: #cbd5e1;">
                Enrollment ID: #{{ $enrollment->id }}
            </p>
        </div>
    </div>
</body>
</html>