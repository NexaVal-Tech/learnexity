{{-- resources/views/emails/student/scholarship_result.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }

    .header { padding:40px; text-align:center; }
    .header-approved { background:linear-gradient(135deg,#15803d 0%,#22c55e 100%); }
    .header-rejected { background:linear-gradient(135deg,#0F172A 0%,#1e3a5f 100%); }
    .header h1 { color:#fff; font-size:22px; font-weight:800; margin:0 0 6px; }
    .header p  { color:rgba(255,255,255,0.75); font-size:14px; margin:0; }
    .header-emoji { font-size:44px; display:block; margin-bottom:12px; }

    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 12px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }

    .course-card { border:1px solid #e2e8f0; border-radius:10px; padding:20px 24px; margin:24px 0; }
    .course-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:6px; }
    .course-name  { font-size:18px; font-weight:800; color:#0F172A; margin:0 0 12px; }
    .detail-row   { display:flex; justify-content:space-between; font-size:14px; color:#374151; padding:6px 0; border-bottom:1px solid #f1f5f9; }
    .detail-row:last-child { border-bottom:none; }
    .detail-val   { font-weight:700; color:#0F172A; }

    .award-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 20px; margin:20px 0; }
    .award-box p { margin:0; font-size:14px; color:#15803d; line-height:1.6; }
    .award-box strong { color:#166534; }

    .cta-wrap { text-align:center; margin:28px 0 8px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:16px; font-weight:700; }
    .reassurance { font-size:13px; color:#64748b; text-align:center; margin-top:12px; }

    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#4A3AFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header {{ $isApproved ? 'header-approved' : 'header-rejected' }}">
      <span class="header-emoji">{{ $isApproved ? '🎓' : '📋' }}</span>
      <h1>{{ $isApproved ? 'Scholarship Awarded!' : 'Application Reviewed' }}</h1>
      <p>{{ $scholarship->course_name }}</p>
    </div>

    <div class="body">
      <p class="greeting">Hi {{ explode(' ', $user->name)[0] }},</p>

      @if($isApproved)
        <p class="text">
          Congratulations! You've been awarded a <strong>full-tuition scholarship</strong> for
          <strong>{{ $scholarship->course_name }}</strong>. Instead of paying the full course price,
          you only need to pay the flat registration fee below to secure your spot — the rest of your
          tuition is fully covered.
        </p>

        <div class="award-box">
          <p><strong>Full-tuition scholarship:</strong> You only owe the registration fee of
            <strong>{{ strtoupper($currency) }} {{ number_format($amountDue ?? 0, 2) }}</strong> —
            no further course payments. Complete it below to lock in your spot.</p>
        </div>
      @else
        <p class="text">
          Thank you for applying for a scholarship for <strong>{{ $scholarship->course_name }}</strong>.
          After careful review, we're unable to award a scholarship at this time. This doesn't affect
          your ability to enroll — you're welcome to continue and pay the standard course price
          (including our flexible installment option) whenever you're ready.
        </p>
      @endif

      <div class="course-card">
        <div class="course-label">Application Summary</div>
        <div class="course-name">{{ $scholarship->course_name }}</div>
        <div class="detail-row">
          <span>Status</span>
          <span class="detail-val">{{ $isApproved ? 'Approved — full tuition' : 'Not approved' }}</span>
        </div>
        @if($isApproved)
          <div class="detail-row">
            <span>Registration fee</span>
            <span class="detail-val">{{ strtoupper($currency) }} {{ number_format($amountDue ?? 0, 2) }}</span>
          </div>
        @endif
      </div>

      <div class="cta-wrap">
        <a href="{{ $paymentUrl }}" class="btn">Proceed to Payment</a>
      </div>
      <p class="reassurance">Secure payment via Paystack &nbsp;·&nbsp; Your data is protected</p>

      <p class="text" style="font-size:14px; color:#64748b; margin-top:24px;">
        Questions about your application or the course? Just reply to this email — we're happy to help.
      </p>

      <p style="text-align:center; margin:20px 0 0;">
        <a href="https://chat.whatsapp.com/GNMAOp0663AAlNOkJYbiCR?s=cl&p=i&mlu=3&amv=2" style="display:inline-block; background:#25D366; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:700;">💬 Join our WhatsApp Community</a>
      </p>
    </div>

    <div class="footer">
      &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp;
      <a href="{{ env('FRONTEND_URL') }}">learnexity.org</a>
    </div>

  </div>
</body>
</html>
