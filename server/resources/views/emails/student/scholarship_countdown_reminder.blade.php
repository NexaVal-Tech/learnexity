{{-- resources/views/emails/student/scholarship_countdown_reminder.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }

    .header { padding:40px; text-align:center; }
    .header-normal { background:linear-gradient(135deg,#4A3AFF 0%,#6C63FF 100%); }
    .header-urgent { background:linear-gradient(135deg,#b91c1c 0%,#ef4444 100%); }
    .header h1 { color:#fff; font-size:22px; font-weight:800; margin:0 0 6px; }
    .header p  { color:rgba(255,255,255,0.75); font-size:14px; margin:0; }
    .header-emoji { font-size:44px; display:block; margin-bottom:12px; }

    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 12px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }

    .countdown-box { border-radius:10px; padding:16px 20px; margin:20px 0; text-align:center; }
    .countdown-box-normal { background:#eef2ff; border:1px solid #c7d2fe; }
    .countdown-box-urgent { background:#fef2f2; border:1px solid #fecaca; }
    .countdown-days { font-size:32px; font-weight:800; margin:0; }
    .countdown-days-normal { color:#4A3AFF; }
    .countdown-days-urgent { color:#b91c1c; }
    .countdown-label { font-size:13px; color:#64748b; margin:4px 0 0; }

    .course-card { border:1px solid #e2e8f0; border-radius:10px; padding:20px 24px; margin:24px 0; }
    .course-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:6px; }
    .course-name  { font-size:18px; font-weight:800; color:#0F172A; margin:0; }

    .cta-wrap { text-align:center; margin:28px 0 8px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:16px; font-weight:700; }

    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#4A3AFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header {{ $isUrgent ? 'header-urgent' : 'header-normal' }}">
      <span class="header-emoji">{{ $isUrgent ? '⏳' : '🎓' }}</span>
      <h1>Don't lose your scholarship spot</h1>
      <p>{{ $scholarship->course_name }}</p>
    </div>

    <div class="body">
      <p class="greeting">Hi {{ explode(' ', $user->name)[0] }},</p>

      <p class="text">
        Just a friendly reminder that your
        {{ $isFullTuition ? 'full-tuition scholarship' : "{$scholarship->discount_percentage}% scholarship" }}
        for <strong>{{ $scholarship->course_name }}</strong> is still waiting to be used.
        @if($isUrgent)
          Time's running short — complete your enrollment soon to keep your spot.
        @else
          There's still plenty of time, but we didn't want this to slip past you.
        @endif
      </p>

      <div class="countdown-box {{ $isUrgent ? 'countdown-box-urgent' : 'countdown-box-normal' }}">
        <p class="countdown-days {{ $isUrgent ? 'countdown-days-urgent' : 'countdown-days-normal' }}">
          {{ $daysRemaining }} day{{ $daysRemaining === 1 ? '' : 's' }} left
        </p>
        <p class="countdown-label">to use your scholarship</p>
      </div>

      <div class="course-card">
        <div class="course-label">Your Award</div>
        <div class="course-name">{{ $isFullTuition ? 'Full-Tuition Scholarship' : "{$scholarship->discount_percentage}% Scholarship" }}</div>
      </div>

      <div class="cta-wrap">
        <a href="{{ $paymentUrl }}" class="btn">Complete Your Enrollment</a>
      </div>

      <p class="text" style="font-size:14px; color:#64748b; margin-top:24px;">
        Questions? Just reply to this email — we're happy to help.
      </p>
    </div>

    <div class="footer">
      &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp;
      <a href="{{ env('FRONTEND_URL') }}">learnexity.org</a>
    </div>

  </div>
</body>
</html>
