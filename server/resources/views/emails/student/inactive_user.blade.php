{{-- resources/views/emails/student/inactive_user.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }

    .hero { background:linear-gradient(135deg,#0F172A 0%,#1e3a5f 100%); padding:44px 40px; text-align:center; }
    .hero-emoji { font-size:48px; display:block; margin-bottom:12px; }
    .hero h1 { color:#fff; font-size:23px; font-weight:800; margin:0 0 6px; }
    .hero p  { color:#94a3b8; font-size:14px; margin:0; }

    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 12px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }

    /* Inactivity pill */
    .badge { display:inline-block; background:#fef2f2; border:1px solid #fecaca; color:#dc2626; font-size:13px; font-weight:700; padding:6px 14px; border-radius:99px; margin-bottom:20px; }

    /* Course cards */
    .course-card { border:1px solid #e2e8f0; border-radius:10px; padding:18px 20px; margin-bottom:12px; }
    .course-name { font-size:15px; font-weight:700; color:#0F172A; margin-bottom:8px; }
    .bar-bg { background:#e2e8f0; border-radius:99px; height:8px; overflow:hidden; margin-bottom:6px; }
    .bar-fill { background:#4A3AFF; height:8px; border-radius:99px; }
    .bar-meta { display:flex; justify-content:space-between; font-size:12px; color:#64748b; }
    .next-sprint { font-size:13px; color:#4A3AFF; font-weight:600; margin-top:8px; }

    /* Motivation quote */
    .quote-box { background:#f0f4ff; border-left:4px solid #4A3AFF; border-radius:0 8px 8px 0; padding:16px 20px; margin:24px 0; font-size:14px; color:#1e40af; line-height:1.6; font-style:italic; }

    /* CTA */
    .cta-wrap { text-align:center; margin:28px 0; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:15px; font-weight:700; }

    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#4A3AFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">

    @php
      $firstName = explode(' ', $user->name)[0];
      if ($daysInactive >= 14) {
          $heroEmoji = '😢';
          $heading   = "We haven't seen you in {$daysInactive} days";
          $subtext   = "Your progress is still here, waiting for you";
      } elseif ($daysInactive >= 7) {
          $heroEmoji = '⏰';
          $heading   = "A week has passed, {$firstName}";
          $subtext   = "Your courses are ready when you are";
      } else {
          $heroEmoji = '👋';
          $heading   = "Miss you already, {$firstName}!";
          $subtext   = "Pick up where you left off";
      }
    @endphp

    <div class="hero">
      <span class="hero-emoji">{{ $heroEmoji }}</span>
      <h1>{{ $heading }}</h1>
      <p>{{ $subtext }}</p>
    </div>

    <div class="body">
      <p class="greeting">Hey {{ $firstName }},</p>

      <div class="badge">{{ $daysInactive }} days since your last login</div>

      @if($daysInactive >= 14)
        <p class="text">
          We noticed it's been a while since you last visited. Life happens — we get it completely. But your investment in yourself is still sitting here, ready for you to pick up exactly where you left off.
        </p>
      @elseif($daysInactive >= 7)
        <p class="text">
          A week is a long time in software development — the industry moves fast, and so should your learning. Your courses are right here. Even one sprint today puts you back on track.
        </p>
      @else
        <p class="text">
          Just two days away and we already miss you! Seriously though — the best learners are consistent learners. Even 20 minutes today keeps the momentum alive.
        </p>
      @endif

      @if(!empty($courseProgress))
        <p class="text" style="font-weight:600; color:#0F172A;">Your progress so far:</p>
        @foreach($courseProgress as $course)
          <div class="course-card">
            <div class="course-name">{{ $course['name'] }}</div>
            <div class="bar-bg">
              <div class="bar-fill" style="width:{{ $course['progress'] }}%;"></div>
            </div>
            <div class="bar-meta">
              <span>{{ $course['progress'] }}% complete</span>
              @if($course['progress'] > 0 && $course['progress'] < 100)
                <span>Keep going!</span>
              @endif
            </div>
            @if(!empty($course['next_sprint']))
              <div class="next-sprint">▶ Up next: {{ $course['next_sprint'] }}</div>
            @endif
          </div>
        @endforeach
      @endif

      <div class="quote-box">
        "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one."
      </div>

      <div class="cta-wrap">
        <a href="{{ env('FRONTEND_URL', 'https://learnexity.org') }}/user/dashboard" class="btn">
          Resume Learning →
        </a>
      </div>

      <p class="text" style="font-size:14px; color:#64748b;">
        If something is stopping you — cost, time, difficulty — reply to this email and let's figure it out together. We want you to succeed.
      </p>
    </div>

    <div class="footer">
      &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp;
      <a href="{{ env('FRONTEND_URL') }}">learnexity.org</a> &nbsp;·&nbsp;
      <a href="{{ env('FRONTEND_URL') }}/user/settings">Unsubscribe</a>
    </div>

  </div>
</body>
</html>