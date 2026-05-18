<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#4A3AFF 0%,#7c3aed 100%); padding:40px; text-align:center; }
    .badge { font-size:56px; margin-bottom:12px; }
    .header h1 { color:#fff; font-size:24px; font-weight:800; margin:0; }
    .header p  { color:#c4b5fd; font-size:14px; margin:8px 0 0; }
    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:600; color:#0F172A; margin-bottom:12px; }
    .text { font-size:15px; color:#374151; line-height:1.6; margin-bottom:16px; }
    .progress-card { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:20px 24px; margin:24px 0; }
    .progress-label { font-size:12px; font-weight:700; text-transform:uppercase; color:#15803d; margin-bottom:8px; }
    .progress-bar-bg { background:#d1fae5; border-radius:99px; height:10px; overflow:hidden; }
    .progress-bar-fill { background:#22c55e; height:10px; border-radius:99px; }
    .progress-text { font-size:13px; color:#166534; margin-top:8px; }
    .stat-row { display:flex; gap:16px; margin:24px 0; }
    .stat { flex:1; background:#f8fafc; border-radius:10px; padding:16px; text-align:center; }
    .stat-num { font-size:28px; font-weight:800; color:#4A3AFF; }
    .stat-lbl { font-size:12px; color:#64748b; margin-top:2px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:13px 32px; border-radius:8px; font-size:15px; font-weight:600; }
    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="badge">🏆</div>
      <h1>Sprint {{ $sprintNumber }} Complete!</h1>
      <p>{{ $courseName }}</p>
    </div>

    <div class="body">
      <p class="greeting">Excellent work, {{ $user->name }}! 🎉</p>
      <p class="text">You've just completed <strong>{{ $sprintName }}</strong>. That's a real milestone — keep that momentum going!</p>

      <div class="progress-card">
        <div class="progress-label">Overall Course Progress</div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width:{{ $progressPercent }}%;"></div>
        </div>
        <div class="progress-text">{{ $progressPercent }}% complete · {{ $sprintNumber }} of {{ $totalSprints }} sprints done</div>
      </div>

      <div class="stat-row">
        <div class="stat">
          <div class="stat-num">{{ $sprintNumber }}</div>
          <div class="stat-lbl">Sprints Done</div>
        </div>
        <div class="stat">
          <div class="stat-num">{{ $totalSprints - $sprintNumber }}</div>
          <div class="stat-lbl">Sprints Left</div>
        </div>
        <div class="stat">
          <div class="stat-num">{{ $progressPercent }}%</div>
          <div class="stat-lbl">Progress</div>
        </div>
      </div>

      @if($sprintNumber < $totalSprints)
        <p class="text">Ready to tackle <strong>Sprint {{ $sprintNumber + 1 }}</strong>? Head back to your dashboard to keep going.</p>
      @else
        <p class="text">You've completed all sprints! Your certificate is ready to claim.</p>
      @endif

      <p style="text-align:center; margin:28px 0;">
        <a href="{{ env('FRONTEND_URL','https://learnexity.org') }}/user/resource" class="btn">Continue Learning →</a>
      </p>
    </div>

    <div class="footer">
      {{ date('Y') }} Learnexity · <a href="{{ env('FRONTEND_URL') }}" style="color:#4A3AFF;">learnexity.org</a>
    </div>
  </div>
</body>
</html>