<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#0F172A 0%,#1e3a5f 100%); padding:36px 40px; }
    .header h1 { color:#fff; font-size:22px; font-weight:700; margin:0 0 6px; }
    .header p  { color:#94a3b8; font-size:14px; margin:0; }
    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:600; color:#0F172A; margin-bottom:12px; }
    .text { font-size:15px; color:#374151; line-height:1.6; margin-bottom:16px; }
    .streak-badge { display:inline-flex; align-items:center; gap:8px; background:#fff7ed; border:1px solid #fed7aa; color:#9a3412; font-size:14px; font-weight:700; padding:8px 16px; border-radius:99px; margin-bottom:24px; }
    .course-card { border:1px solid #e2e8f0; border-radius:10px; padding:18px 20px; margin-bottom:12px; }
    .course-name { font-size:15px; font-weight:600; color:#0F172A; margin-bottom:8px; }
    .bar-bg { background:#e2e8f0; border-radius:99px; height:8px; overflow:hidden; margin-bottom:6px; }
    .bar-fill { background:#4A3AFF; height:8px; border-radius:99px; }
    .bar-label { font-size:12px; color:#64748b; }
    .next-sprint { font-size:13px; color:#4A3AFF; font-weight:600; margin-top:8px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:13px 32px; border-radius:8px; font-size:15px; font-weight:600; }
    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Daily Learning Check-in</h1>
      <p>{{ now()->format('l, F j, Y') }}</p>
    </div>

    <div class="body">
      <p class="greeting">Good morning, {{ $user->name }}!</p>

      @if($loginStreakDays > 0)
        <div class="streak-badge"> {{ $loginStreakDays }}-day learning streak — don't break it!</div>
      @endif

      <p class="text">Here's a snapshot of where you stand today. A little progress each day adds up to something big.</p>

      @foreach($enrolledCourses as $course)
        <div class="course-card">
          <div class="course-name">{{ $course['name'] }}</div>
          <div class="bar-bg">
            <div class="bar-fill" style="width:{{ $course['progress'] }}%;"></div>
          </div>
          <div class="bar-label">{{ $course['progress'] }}% complete</div>
          @if(!empty($course['next_sprint']))
            <div class="next-sprint">Up next: {{ $course['next_sprint'] }}</div>
          @endif
        </div>
      @endforeach

      <p class="text" style="margin-top:24px;">Consistency is the secret — even 20 minutes today keeps you ahead of the curve.</p>

      <p style="text-align:center; margin:28px 0;">
        <a href="{{ env('FRONTEND_URL','https://learnexity.org') }}/user/dashboard" class="btn">Go to My Dashboard →</a>
      </p>
    </div>

    <div class="footer">
      {{ date('Y') }} Learnexity ·
      <a href="{{ env('FRONTEND_URL') }}/user/settings" style="color:#4A3AFF;">Manage email preferences</a>
    </div>
  </div>
</body>
</html>