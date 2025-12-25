<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f5;
            padding: 40px 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #f5f5f5;
        }
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 40px;
        }
        .logo svg {
            width: 40px;
            height: 40px;
        }
        .logo-text {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
        }
        .content-card {
            background-color: white;
            border-radius: 16px;
            padding: 48px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
        }
        .subheading {
            font-size: 20px;
            font-weight: 400;
            color: #1a1a1a;
            margin-bottom: 32px;
        }
        .message {
            font-size: 15px;
            color: #4a4a4a;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .receipt-section {
            margin-bottom: 40px;
        }
        .receipt-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 24px;
        }
        .receipt-box {
            background-color: #fafafa;
            border-radius: 12px;
            padding: 24px;
        }
        .receipt-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #e8e8e8;
        }
        .receipt-row:last-child {
            border-bottom: none;
        }
        .receipt-label {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
            color: #6b6b6b;
        }
        .receipt-label svg {
            width: 20px;
            height: 20px;
            color: #9b9b9b;
        }
        .receipt-value {
            font-size: 14px;
            font-weight: 500;
            color: #1a1a1a;
            text-align: right;
        }
        .amount {
            color: #10b981;
            font-size: 16px;
            font-weight: 600;
        }
        .getting-started {
            margin-bottom: 40px;
        }
        .getting-started-title {
            font-size: 18px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 24px;
        }
        .step {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
        }
        .step:last-child {
            margin-bottom: 0;
        }
        .step-number {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
            background-color: #f0f0f0;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            color: #4a4a4a;
        }
        .step-content {
            flex: 1;
        }
        .step-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
        }
        .step-description {
            font-size: 14px;
            color: #6b6b6b;
            line-height: 1.5;
        }
        .button-container {
            text-align: center;
            margin-bottom: 24px;
        }
        .cta-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 32px;
            background-color: #1a1a1a;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .cta-button:hover {
            background-color: #2a2a2a;
        }
        .cta-button svg {
            width: 16px;
            height: 16px;
        }
        .link-text {
            text-align: center;
            font-size: 13px;
            color: #6b6b6b;
            margin-bottom: 32px;
        }
        .link-text a {
            color: #1a1a1a;
            text-decoration: none;
            word-break: break-all;
        }
        .disclaimer {
            font-size: 13px;
            color: #6b6b6b;
            text-align: center;
            margin-bottom: 48px;
            padding-top: 32px;
            border-top: 1px solid #e8e8e8;
        }
        .footer {
            margin-top: 40px;
        }
        .footer-support {
            font-size: 14px;
            color: #6b6b6b;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .footer-email {
            font-weight: 600;
            color: #1a1a1a;
        }
        .footer-branding {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .footer-logo {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .footer-logo svg {
            width: 32px;
            height: 32px;
        }
        .footer-logo-text {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
        }
        .social-links {
            display: flex;
            gap: 16px;
        }
        .social-links a {
            color: #6b6b6b;
            transition: color 0.2s;
        }
        .social-links a:hover {
            color: #1a1a1a;
        }
        .social-links svg {
            width: 24px;
            height: 24px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Logo -->
        <div class="logo">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 8L20 2L32 8V20L20 32L8 20V8Z" fill="#7C3AED"/>
                <path d="M16 16L20 14L24 16V20L20 24L16 20V16Z" fill="white"/>
            </svg>
            <span class="logo-text">learnexity</span>
        </div>

        <!-- Main Content Card -->
        <div class="content-card">
            <!-- Greeting -->
            <div class="greeting">Welcome, {{ $enrollment->user->name ?? 'John Doe' }}!</div>
            <div class="subheading">Your enrolment has been confirmed!</div>

            <!-- Message -->
            <p class="message">
                Thank you for enrolling in {{ $enrollment->course_name ?? 'Complete Product Management Course' }}. We're excited to have you join our community of product managers!<br><br>
                Your payment has been successfully processed, and you now have full access to all course materials, resources, and our exclusive community.
            </p>

            <!-- Transaction Receipt -->
            <div class="receipt-section">
                <div class="receipt-title">Transaction Receipt</div>
                <div class="receipt-box">
                    <div class="receipt-row">
                        <div class="receipt-label">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <rect x="2" y="3" width="20" height="14" rx="2"/>
                                <line x1="2" y1="9" x2="22" y2="9"/>
                            </svg>
                            Amount Paid
                        </div>
                        <div class="receipt-value amount">
                            @if($amount)
                                ${{ number_format($amount / 100, 2) }}
                            @else
                                $199.00
                            @endif
                        </div>
                    </div>
                    <div class="receipt-row">
                        <div class="receipt-label">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
                            </svg>
                            Transaction ID
                        </div>
                        <div class="receipt-value">{{ $enrollment->transaction_id ?? 'TXN-XI51TMQCU' }}</div>
                    </div>
                    <div class="receipt-row">
                        <div class="receipt-label">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Date
                        </div>
                        <div class="receipt-value">
                            @if(isset($enrollment->payment_date))
                                {{ $enrollment->payment_date->format('F d, Y') }}
                            @else
                                October 10, 2025
                            @endif
                        </div>
                    </div>
                    <div class="receipt-row">
                        <div class="receipt-label">
                            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                <rect x="2" y="5" width="20" height="14" rx="2"/>
                                <line x1="2" y1="10" x2="22" y2="10"/>
                            </svg>
                            Payment Method
                        </div>
                        <div class="receipt-value">Paystack</div>
                    </div>
                </div>
            </div>

            <!-- Getting Started -->
            <div class="getting-started">
                <div class="getting-started-title">Getting Started</div>
                
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-title">Access Your Dashboard</div>
                        <div class="step-description">Log in to your account to view all course materials and start learning immediately.</div>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-title">Join Our Community</div>
                        <div class="step-description">Connect with fellow students and instructors in our exclusive community forum.</div>
                    </div>
                </div>

                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-title">Download Resources</div>
                        <div class="step-description">Get access to templates, case studies, and additional learning materials.</div>
                    </div>
                </div>
            </div>

            <!-- CTA Button -->
            <div class="button-container">
                <a href="{{ config('app.url') }}/user/dashboard" class="cta-button">
                    Access Dashboard
                    <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                    </svg>
                </a>
            </div>

            <div class="link-text">
                Or copy this link: <a href="{{ config('app.url') }}/user/dashboard">{{ config('app.url') }}/dashboard</a>
            </div>

            <!-- Disclaimer -->
            <div class="disclaimer">
                This is an automated email confirmation. Please do not reply to this email.
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-support">
                Our support team is here to assist you. If you have any questions or need assistance accessing your course, please don't hesitate to reach out.<br>
                <span class="footer-email">Email: support@learnexity.org</span>
            </p>

            <div class="footer-branding">
                <div class="footer-logo">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 8L20 2L32 8V20L20 32L8 20V8Z" fill="#7C3AED"/>
                        <path d="M16 16L20 14L24 16V20L20 24L16 20V16Z" fill="white"/>
                    </svg>
                    <span class="footer-logo-text">learnexity</span>
                </div>

                <div class="social-links">
                    <a href="#">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                        </svg>
                    </a>
                    <a href="#">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                        </svg>
                    </a>
                    <a href="#">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html>