<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Enrolment Confirmation</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4A3AFF 0%, #7c3aed 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 26px; }
    .header p  { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
    .body   { padding: 32px; }
    .card   { background: #f8fafc; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .card h3 { margin: 0 0 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; }
    .row    { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #64748b; }
    .row .value { font-weight: 600; color: #1e293b; }
    .pill   { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }
    .pill-green  { background: #dcfce7; color: #16a34a; }
    .pill-orange { background: #fff7ed; color: #ea580c; }
    .cta    { text-align: center; margin: 28px 0 8px; }
    .cta a  { display: inline-block; background: #4A3AFF; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; }
    .footer { background: #f1f5f9; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
    <body>
    <div class="wrapper">

    <div class="header">
        <h1>{{ $enrollment->course->emoji }} {{ $isFullyPaid ? 'You\'re all set!' : 'Payment received!' }}</h1>
        <p>{{ $isFullyPaid ? 'Enrolment fully confirmed for ' . $enrollment->student_name : 'Instalment ' . $enrollment->installments_paid . ' of ' . $enrollment->total_installments . ' paid' }}</p>
    </div>

    <div class="body">
        <p style="color:#475569;font-size:15px;line-height:1.6;">
        Hi <strong>{{ $enrollment->parent_name }}</strong>, thank you for enrolling <strong>{{ $enrollment->student_name }}</strong>
        in the Learnexity Kids Programme. Here is a summary of this payment.
        </p>

        <div class="card">
        <h3>Enrolment Details</h3>
        <div class="row"><span class="label">Course</span>        <span class="value">{{ $enrollment->course->name }}</span></div>
        <div class="row"><span class="label">Track</span>         <span class="value">{{ ucwords(str_replace('_', ' ', $enrollment->chosen_track)) }}</span></div>
        <div class="row"><span class="label">Session Type</span>  <span class="value">{{ $enrollment->session_type === 'one_on_one' ? 'One-on-One Coaching' : 'Group Mentorship' }}</span></div>
        <div class="row"><span class="label">Student</span>       <span class="value">{{ $enrollment->student_name }}, age {{ $enrollment->student_age }}</span></div>
        </div>

        <div class="card">
        <h3>Payment Summary</h3>
        <div class="row">
            <span class="label">Amount Paid Now</span>
            <span class="value">{{ $enrollment->currency }} {{ number_format($amountPaid, 2) }}</span>
        </div>
        <div class="row">
            <span class="label">Total Paid So Far</span>
            <span class="value">{{ $enrollment->currency }} {{ number_format($enrollment->amount_paid, 2) }}</span>
        </div>
        <div class="row">
            <span class="label">Total Course Fee</span>
            <span class="value">{{ $enrollment->currency }} {{ number_format($enrollment->total_price, 2) }}</span>
        </div>
        @if (!$isFullyPaid)
        <div class="row">
            <span class="label">Remaining Balance</span>
            <span class="value" style="color:#ea580c;">{{ $enrollment->currency }} {{ number_format($enrollment->total_price - $enrollment->amount_paid, 2) }}</span>
        </div>
        <div class="row">
            <span class="label">Next Payment Due</span>
            <span class="value">{{ $enrollment->next_payment_due?->format('d M Y') ?? '—' }}</span>
        </div>
        @endif
        <div class="row">
            <span class="label">Status</span>
            <span class="value">
            <span class="pill {{ $isFullyPaid ? 'pill-green' : 'pill-orange' }}">
                {{ $isFullyPaid ? 'Fully Paid' : 'Partial — ' . $enrollment->installments_remaining() . ' payment(s) remaining' }}
            </span>
            </span>
        </div>
        </div>

        @if (!$isFullyPaid)
        <div class="cta">
        <a href="{{ config('app.frontend_url') }}/kids/payment/{{ $enrollment->id }}?token={{ $enrollment->resume_token }}">
            Make Your Next Payment →
        </a>
        </div>
        <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:8px;">
        Bookmark this link — you don't need an account to resume your payment.
        </p>
        @else
        <p style="color:#475569;font-size:14px;line-height:1.6;margin-top:16px;">
        Our team will be in touch within 24 hours with session scheduling details. 
        We're excited to have {{ $enrollment->student_name }} join us! 🚀
        </p>
        @endif
    </div>

    <div class="footer">
        Learnexity Kids Programme &nbsp;·&nbsp;
        Questions? Email <a href="mailto:info@learnexity.org" style="color:#4A3AFF;">info@learnexity.org</a>
    </div>

    </div>
    </body>
</html>