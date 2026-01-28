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
            background: linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%);
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
            border-left: 4px solid #7C3AED;
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
            padding: 8px 0;
            border-bottom: 1px solid #E5E7EB;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #6B7280;
        }
        .info-value {
            color: #111827;
            font-weight: 500;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: #7C3AED;
            color: white !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 24px 0;
            transition: background 0.3s;
        }
        .button:hover {
            background: #6D28D9;
        }
        .button-container {
            text-align: center;
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
            color: #7C3AED;
            text-decoration: none;
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
                gap: 4px;
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
            <p>Hi <strong>{{ $enrollment->user->name }}</strong>,</p>
            
            <p>Great news! Your payment for <strong>{{ $enrollment->course_name }}</strong> has been successfully processed.</p>
            
            <div class="info-box">
                <h3>Payment Details</h3>
                <div class="info-row">
                    <span class="info-label">Amount Paid:</span>
                    <span class="info-value">
                        {{ $enrollment->currency === 'NGN' ? '₦' : '$' }}{{ number_format($amount ?? $enrollment->amount_paid, 2) }}
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Transaction ID:</span>
                    <span class="info-value">{{ $enrollment->transaction_id }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Learning Track:</span>
                    <span class="info-value">
                        @switch($enrollment->learning_track)
                            @case('one_on_one')
                                One-on-One Coaching
                                @break
                            @case('group_mentorship')
                                Group Mentorship Program
                                @break
                            @case('self_paced')
                                Self-Paced Learning
                                @break
                            @default
                                Self-Paced Learning
                        @endswitch
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment Type:</span>
                    <span class="info-value">
                        {{ $enrollment->payment_type === 'onetime' ? 'One-Time Payment' : 'Installment Payment' }}
                    </span>
                </div>
                @if($enrollment->payment_type === 'installment' && $enrollment->next_payment_due)
                <div class="info-row">
                    <span class="info-label">Installment Progress:</span>
                    <span class="info-value">
                        {{ $enrollment->installments_paid }} of {{ $enrollment->total_installments }} paid
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">Next Payment Due:</span>
                    <span class="info-value">{{ \Carbon\Carbon::parse($enrollment->next_payment_due)->format('F j, Y') }}</span>
                </div>
                @endif
            </div>

            @if($enrollment->payment_type === 'installment' && $enrollment->payment_status !== 'completed')
            <div class="alert-box">
                <p><strong>⚠️ Reminder:</strong> Please ensure your next installment payment is made by <strong>{{ \Carbon\Carbon::parse($enrollment->next_payment_due)->format('F j, Y') }}</strong> to maintain uninterrupted access to course materials.</p>
            </div>
            @endif

            <div class="divider"></div>

            <p><strong>What's Next?</strong></p>
            <p>You now have {{ $enrollment->payment_type === 'installment' && $enrollment->payment_status !== 'completed' ? 'access' : 'full access' }} to all course materials. Start learning right away and make the most of your investment!</p>
            
            <div class="button-container">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/user/resources?courseId={{ $enrollment->course_id }}" class="button">
                    Access Course Materials →
                </a>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #6B7280;">
                If you have any questions or need assistance, feel free to reach out to our support team. We're here to help you succeed!
            </p>
            
            <p style="margin-top: 24px;">
                <strong>Happy learning! 🚀</strong>
            </p>
        </div>
        
        <div class="footer">
            <p><strong>{{ config('app.name', 'Learning Platform') }}</strong></p>
            <p>© {{ date('Y') }} All rights reserved.</p>
            <p style="margin-top: 16px;">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}">Visit Website</a> • 
                <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/support">Support</a> • 
                <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/contact">Contact</a>
            </p>
        </div>
    </div>
</body>
</html>