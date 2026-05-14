{{-- resources/views/emails/student/login_welcome_back.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#4A3AFF 0%,#7c3aed 100%); padding:36px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:22px; font-weight:700; margin:0 0 6px; }
    .header p  { color:#c4b5fd; font-size:14px; margin:0; }
    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:600; color:#0F172A; margin-bottom:12px; }
    .text { font-size:15px; color:#374151; line-height:1.6; margin-bottom:16px; }
    .streak { display:inline-flex; align-items:center; gap:8px; background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; font-size:15px; font-weight:700; padding:10px 20px; border-radius:99px; margin:8px 0 20px; }
    .course-card { border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; }
    .course-info .name { font-size:14px; font-weight:600; color:#0F172A; }
    .course-info .sub  { font-size:12px; color:#64748b; margin-top:2px; }
    .pill { background:#ede9fe; color:#5b21b6; font-size:13px; font-weight:700; padding:4px 12px; border-radius:99px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:13px 32px; border-radius:8px; font-size:15px; font-weight:600; }
    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Welcome Back!</h1>
      <p>Good to see you again on Learnexity</p>
    </div>

    <div class="body">
      <p class="greeting">Hey {{ $user->name }},</p>

      @if($loginStreakDays >= 2)
        <div class="streak">{{ $loginStreakDays }}-day learning streak!</div>
      @endif

      <p class="text">Pick up right where you left off. Here's a quick look at your progress:</p>

      @foreach($courseProgress as $course)
        <div class="course-card">
          <div class="course-info">
            <div class="name">{{ $course['name'] }}</div>
            <div class="sub">{{ $course['progress'] }}% complete</div>
          </div>
          <div class="pill">{{ $course['progress'] }}%</div>
        </div>
      @endforeach

      <p style="text-align:center; margin:28px 0;">
        <a href="{{ env('FRONTEND_URL','https://learnexity.org') }}/user/dashboard" class="btn">Continue Learning →</a>
      </p>
    </div>

    <div class="footer">
      {{ date('Y') }} Learnexity · <a href="{{ env('FRONTEND_URL') }}" style="color:#4A3AFF;">learnexity.org</a>
    </div>
  </div>
</body>
</html>