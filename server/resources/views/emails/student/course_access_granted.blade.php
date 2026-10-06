{{-- resources/views/emails/student/course_access_granted.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { padding:40px; text-align:center; background:linear-gradient(135deg,#2e1065 0%,#4A3AFF 100%); }
    .header-emoji { font-size:44px; display:block; margin-bottom:12px; }
    .header h1 { color:#fff; font-size:22px; font-weight:800; margin:0 0 6px; }
    .header p { color:rgba(255,255,255,0.8); font-size:14px; margin:0; }
    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 12px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }
    .cta-wrap { text-align:center; margin:28px 0 8px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff !important; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:16px; font-weight:700; }
    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#4A3AFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="header-emoji">🎉</span>
      <h1>Your course is unlocked!</h1>
      <p>{{ $courseName }}</p>
    </div>
    <div class="body">
      <p class="greeting">Hi {{ explode(' ', trim($user->name))[0] }},</p>
      <p class="text">
        Good news — you now have full access to <strong>{{ $courseName }}</strong>.
        All the course materials are ready for you, so you can start learning right away.
      </p>
      <div class="cta-wrap">
        <a href="{{ $learningUrl }}" class="btn">Start Learning</a>
      </div>
      <p class="text" style="font-size:14px; color:#64748b; margin-top:24px;">
        Questions? Just reply to this email — we're happy to help.
      </p>
    </div>
    <div class="footer">
      &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp;
      <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')) }}">learnexity.org</a>
    </div>
  </div>
</body>
</html>
