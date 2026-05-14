{{-- resources/views/emails/student/performance.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header-positive { background:linear-gradient(135deg,#059669 0%,#10b981 100%); padding:36px 40px; text-align:center; }
    .header-neutral  { background:linear-gradient(135deg,#0F172A 0%,#1e3a5f 100%); padding:36px 40px; text-align:center; }
    .header-warning  { background:linear-gradient(135deg,#d97706 0%,#f59e0b 100%); padding:36px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:22px; font-weight:700; margin:0 0 6px; }
    .header p  { color:rgba(255,255,255,0.75); font-size:14px; margin:0; }
    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:600; color:#0F172A; margin-bottom:12px; }
    .text { font-size:15px; color:#374151; line-height:1.6; margin-bottom:16px; }
    .scores-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:24px 0; }
    .score-card { background:#f8fafc; border-radius:10px; padding:16px; }
    .score-icon { font-size:20px; margin-bottom:4px; }
    .score-label { font-size:11px; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:4px; }
    .score-val { font-size:24px; font-weight:800; }
    .score-high { color:#059669; }
    .score-mid  { color:#d97706; }
    .score-low  { color:#dc2626; }
    .message-box { background:#eff6ff; border-left:4px solid #4A3AFF; padding:16px 20px; border-radius:0 8px 8px 0; font-size:14px; color:#1e40af; margin:20px 0; line-height:1.6; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:13px 32px; border-radius:8px; font-size:15px; font-weight:600; }
    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    @php
      $positiveTypes = ['high_performer','streak_milestone','completion_near'];
      $warningTypes  = ['slow_progress','streak_broken','quality_drop'];
      $headerClass   = in_array($emailType, $positiveTypes) ? 'header-positive' : (in_array($emailType, $warningTypes) ? 'header-warning' : 'header-neutral');
      $emoji = [
        'slow_progress'    => '⏰',
        'high_performer'   => '🌟',
        'streak_broken'    => '😢',
        'streak_milestone' => '🔥',
        'completion_near'  => '🏁',
        'quality_drop'     => '📉',
      ][$emailType] ?? '📊';
    @endphp

    <div class="{{ $headerClass }}">
      <h1>{{ $emoji }} Performance Update</h1>
      <p>{{ $courseName }}</p>
    </div>

    <div class="body">
      <p class="greeting">Hi {{ $user->name }},</p>

      <div class="message-box">{{ $message }}</div>

      <div class="scores-grid">
        @php
          function scoreClass($s) {
            if ($s >= 70) return 'score-high';
            if ($s >= 40) return 'score-mid';
            return 'score-low';
          }
        @endphp
        <div class="score-card">
          <div class="score-icon">⚡</div>
          <div class="score-label">Speed</div>
          <div class="score-val {{ scoreClass($scores['speed'] ?? 0) }}">{{ $scores['speed'] ?? 0 }}%</div>
        </div>
        <div class="score-card">
          <div class="score-label">Quality</div>
          <div class="score-val {{ scoreClass($scores['quality'] ?? 0) }}">{{ $scores['quality'] ?? 0 }}%</div>
        </div>
        <div class="score-card">
          <div class="score-label">Reliability</div>
          <div class="score-val {{ scoreClass($scores['reliability'] ?? 0) }}">{{ $scores['reliability'] ?? 0 }}%</div>
        </div>
        <div class="score-card">
          <div class="score-label">Problem Solving</div>
          <div class="score-val {{ scoreClass($scores['problem_solving'] ?? 0) }}">{{ $scores['problem_solving'] ?? 0 }}%</div>
        </div>
      </div>

      <p style="text-align:center; margin:28px 0;">
        <a href="{{ $actionUrl ?? env('FRONTEND_URL','https://learnexity.org').'/user/resource' }}" class="btn">View My Progress →</a>
      </p>
    </div>

    <div class="footer">
      {{ date('Y') }} Learnexity · <a href="{{ env('FRONTEND_URL') }}" style="color:#4A3AFF;">learnexity.org</a>
    </div>
  </div>
</body>
</html>