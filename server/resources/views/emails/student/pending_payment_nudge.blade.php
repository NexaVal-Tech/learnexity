{{-- resources/views/emails/student/pending_payment_nudge.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }

    .header { padding:40px; text-align:center; }
    .header-1 { background:linear-gradient(135deg,#0F172A 0%,#1e3a5f 100%); }
    .header-2 { background:linear-gradient(135deg,#d97706 0%,#f59e0b 100%); }
    .header-3 { background:linear-gradient(135deg,#dc2626 0%,#ef4444 100%); }
    .header h1 { color:#fff; font-size:22px; font-weight:800; margin:0 0 6px; }
    .header p  { color:rgba(255,255,255,0.75); font-size:14px; margin:0; }
    .header-emoji { font-size:44px; display:block; margin-bottom:12px; }

    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 12px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }

    /* Course summary card */
    .course-card { border:1px solid #e2e8f0; border-radius:10px; padding:20px 24px; margin:24px 0; }
    .course-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:6px; }
    .course-name  { font-size:18px; font-weight:800; color:#0F172A; margin:0 0 12px; }
    .detail-row   { display:flex; justify-content:space-between; font-size:14px; color:#374151; padding:6px 0; border-bottom:1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom:none; }
    .detail-val   { font-weight:700; color:#0F172A; }

    /* Urgency pill */
    .urgency { display:inline-block; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; font-size:13px; font-weight:700; padding:6px 14px; border-radius:99px; margin-bottom:20px; }

    /* Installment highlight */
    .installment-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 20px; margin:20px 0; }
    .installment-box p { margin:0; font-size:14px; color:#15803d; line-height:1.6; }
    .installment-box strong { color:#166534; }

    /* CTA */
    .cta-wrap { text-align:center; margin:28px 0 8px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:16px; font-weight:700; }
    .reassurance { font-size:13px; color:#64748b; text-align:center; margin-top:12px; }

    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#4A3AFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">

    @php
      $headerClass = 'header-' . min($nudgeDay, 3);
      $emojis = [1 => '📋', 2 => '⏳', 3 => '🚨'];
      $emoji  = $emojis[min($nudgeDay, 3)];

      $messages = [
        1 => "You started the enrollment process for <strong>{$enrollment->course_name}</strong> but haven't completed payment yet. Your spot is reserved — finish now and start learning today.",
        2 => "We saved your spot in <strong>{$enrollment->course_name}</strong>, but it won't wait forever. Hundreds of students are already making progress — don't fall behind before you even start.",
        3 => "This is your final reminder. Your enrollment in <strong>{$enrollment->course_name}</strong> is still pending. Complete payment now or your reserved spot may be released to another student.",
      ];
      $bodyMessage = $messages[min($nudgeDay, 3)];
    @endphp

    <div class="header {{ $headerClass }}">
      <span class="header-emoji">{{ $emoji }}</span>
      <h1>Complete Your Enrollment</h1>
      <p>{{ $enrollment->course_name }}</p>
    </div>

    <div class="body">
      <p class="greeting">Hi {{ explode(' ', $user->name)[0] }},</p>

      @if($nudgeDay >= 2)
        <div class="urgency">Payment still pending — day {{ $nudgeDay }}</div>
      @endif

      <p class="text">{!! $bodyMessage !!}</p>

      <div class="course-card">
        <div class="course-label">Your Enrollment Summary</div>
        <div class="course-name">{{ $enrollment->course_name }}</div>
        <div class="detail-row">
          <span>Payment type</span>
          <span class="detail-val">{{ $enrollment->payment_type === 'onetime' ? 'One-time payment' : 'Installment plan (4×)' }}</span>
        </div>
        <div class="detail-row">
          <span>Total amount</span>
          <span class="detail-val">{{ strtoupper($enrollment->currency) }} {{ number_format($enrollment->total_amount, 2) }}</span>
        </div>
        @if($enrollment->payment_type === 'installment')
          <div class="detail-row">
            <span>First installment</span>
            <span class="detail-val">{{ strtoupper($enrollment->currency) }} {{ number_format($enrollment->installment_amount, 2) }}</span>
          </div>
        @endif
        <div class="detail-row">
          <span>Learning track</span>
          <span class="detail-val">{{ ucwords(str_replace('_', ' ', $enrollment->learning_track)) }}</span>
        </div>
      </div>

      @if($enrollment->payment_type === 'installment')
        <div class="installment-box">
          <p><strong>Installment plan:</strong> Pay just <strong>{{ strtoupper($enrollment->currency) }} {{ number_format($enrollment->installment_amount, 2) }}</strong> today to unlock full access, then spread the rest over 3 more payments every 4 weeks. No interest, no penalties.</p>
        </div>
      @endif

      <div class="cta-wrap">
        <a href="{{ $paymentUrl }}" class="btn">Complete Payment Now →</a>
      </div>
      <p class="reassurance">Secure payment via Paystack &nbsp;·&nbsp; Your data is protected</p>

      <p class="text" style="font-size:14px; color:#64748b; margin-top:24px;">
        If you have any questions about pricing, scholarships, or the course content, just reply to this email. We're happy to help.
      </p>
    </div>

    <div class="footer">
      &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp;
      <a href="{{ env('FRONTEND_URL') }}">learnexity.org</a>
    </div>

  </div>
</body>
</html>