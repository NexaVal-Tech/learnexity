<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Reminder</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .alert {
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .alert-warning {
            background-color: #FFF3CD;
            border: 1px solid #FFC107;
            color: #856404;
        }
        .alert-danger {
            background-color: #F8D7DA;
            border: 1px solid #F5C6CB;
            color: #721C24;
        }
        .payment-details {
            background-color: #F8F9FA;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .payment-details h3 {
            margin-top: 0;
            color: #6366F1;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #DEE2E6;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #495057;
        }
        .detail-value {
            color: #212529;
        }
        .amount {
            font-size: 24px;
            font-weight: bold;
            color: #6366F1;
        }
        .cta-button {
            display: inline-block;
            background-color: #6366F1;
            color: white !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            text-align: center;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #4F46E5;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #DEE2E6;
            font-size: 14px;
            color: #6C757D;
            text-align: center;
        }
        .consequences {
            background-color: #FFF3CD;
            border-left: 4px solid #FFC107;
            padding: 15px;
            margin: 20px 0;
        }
        .consequences h4 {
            margin-top: 0;
            color: #856404;
        }
        .consequences ul {
            margin: 10px 0;
            padding-left: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="color: #6366F1; margin-bottom: 10px;">
                @if($isOverdue)
                    ⚠️ Payment Overdue
                @else
                    📅 Payment Reminder
                @endif
            </h1>
            <p style="color: #6C757D; font-size: 16px;">{{ $courseName }}</p>
        </div>

        @if($isOverdue)
            <div class="alert alert-danger">
                <strong>⚠️ Your payment is {{ $daysUntilDue }} days overdue!</strong>
                <p style="margin: 10px 0 0 0;">
                    Your access to course materials may be suspended if payment is not received soon.
                </p>
            </div>
        @else
            <div class="alert alert-warning">
                <strong>📅 Payment Due {{ $daysUntilDue > 0 ? "in {$daysUntilDue} days" : "today" }}</strong>
                <p style="margin: 10px 0 0 0;">
                    This is a friendly reminder that your next installment payment is due soon.
                </p>
            </div>
        @endif

        <div class="payment-details">
            <h3>Payment Details</h3>
            
            <div class="detail-row">
                <span class="detail-label">Installment:</span>
                <span class="detail-value">{{ $installmentNumber }} of {{ $totalInstallments }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Amount Due:</span>
                <span class="detail-value amount">
                    {{ $currency === 'NGN' ? '₦' : '$' }}{{ number_format($amount, 2) }}
                </span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Due Date:</span>
                <span class="detail-value">{{ $dueDate->format('F j, Y') }}</span>
            </div>
        </div>

        <div style="text-align: center;">
            <a href="{{ $paymentUrl }}" class="cta-button">
                {{ $isOverdue ? 'Pay Now to Restore Access' : 'Make Payment' }}
            </a>
        </div>

        @if($isOverdue)
            <div class="consequences">
                <h4>⚠️ Important: Course Access Status</h4>
                <ul>
                    <li>Your access to course materials is currently <strong>suspended</strong></li>
                    <li>Complete your payment immediately to regain full access</li>
                    <li>Continued non-payment may result in enrollment cancellation</li>
                </ul>
            </div>
        @else
            <div style="background-color: #E7F3FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h4 style="margin-top: 0; color: #0066CC;">💡 Payment Tip</h4>
                <p style="margin: 0;">
                    Pay early to avoid any interruption to your learning. Your access remains active as long as payments are up to date.
                </p>
            </div>
        @endif

        <div class="footer">
            <p>
                If you've already made this payment, please disregard this email. 
                It may take up to 24 hours for payments to reflect in our system.
            </p>
            <p>
                Having trouble? Contact our support team at 
                <a href="mailto:support@yourplatform.com" style="color: #6366F1;">support@yourplatform.com</a>
            </p>
            <p style="margin-top: 20px;">
                <strong>Remaining Installments:</strong> {{ $totalInstallments - $installmentNumber }}
            </p>
        </div>
    </div>
</body>
</html>