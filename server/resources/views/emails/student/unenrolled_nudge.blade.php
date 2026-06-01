{{-- resources/views/emails/student/unenrolled_nudge.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }

    .hero { padding:44px 40px; text-align:center; }
    .hero-1 { background:linear-gradient(135deg,#0F172A 0%,#4A3AFF 100%); }
    .hero-2 { background:linear-gradient(135deg,#0F172A 0%,#059669 100%); }
    .hero-3 { background:linear-gradient(135deg,#d97706 0%,#dc2626 100%); }
    .hero-emoji { font-size:48px; display:block; margin-bottom:12px; }
    .hero h1 { color:#fff; font-size:23px; font-weight:800; margin:0 0 6px; }
    .hero p  { color:rgba(255,255,255,0.75); font-size:14px; margin:0; }

    .body { padding:40px; }
    .greeting { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 12px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }

    /* Course tracks grid */
    .tracks { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:24px 0; }
    .track { border:1px solid #e2e8f0; border-radius:10px; padding:16px; }
    .track-emoji { font-size:24px; margin-bottom:8px; display:block; }
    .track-name  { font-size:14px; font-weight:700; color:#0F172A; margin:0 0 4px; }
    .track-desc  { font-size:12px; color:#64748b; margin:0; line-height:1.4; }

    /* Social proof */
    .proof-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:20px 24px; margin:24px 0; }
    .proof-box p { margin:0; font-size:14px; color:#15803d; line-height:1.6; }

    /* Installment callout */
    .installment { background:#f0f4ff; border-left:4px solid #4A3AFF; border-radius:0 8px 8px 0; padding:16px 20px; margin:20px 0; font-size:14px; color:#1e40af; line-height:1.6; }

    /* CTA */
    .cta-wrap { text-align:center; margin:28px 0; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:16px; font-weight:700; }

    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#4A3AFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">

    @php
      $firstName = explode(' ', $user->name)[0];
      $heroClass = 'hero-' . min($nudgeDay, 3);

      $configs = [
        1 => [
          'emoji'   => '🚀',
          'heading' => 'Ready to start building?',
          'sub'     => 'Your account is set up — one step left',
        ],
        2 => [
          'emoji'   => '💡',
          'heading' => 'Still thinking about it?',
          'sub'     => 'Let us show you what you\'ll learn',
        ],
        3 => [
          'emoji'   => '⏳',
          'heading' => 'This is our last nudge',
          'sub'     => 'We\'d hate to see your potential go untapped',
        ],
      ];
      $cfg = $configs[min($nudgeDay, 3)];
    @endphp

    <div class="hero {{ $heroClass }}">
      <span class="hero-emoji">{{ $cfg['emoji'] }}</span>
      <h1>{{ $cfg['heading'] }}</h1>
      <p>{{ $cfg['sub'] }}</p>
    </div>

    <div class="body">
      <p class="greeting">Hi {{ $firstName }},</p>

      @if($nudgeDay === 1)
        <p class="text">
          You created your Learnexity account — that's the first step. But you haven't enrolled in a course yet, and we'd love to change that. Here's what's available for you:
        </p>

        <div class="tracks">
          <div class="track">
            <span class="track-emoji">💻</span>
            <p class="track-name">Software Engineering</p>
            <p class="track-desc">6-month AI-augmented course. Build real products from day one.</p>
          </div>
          <div class="track">
            <span class="track-emoji">🎮</span>
            <p class="track-name">Game Builder</p>
            <p class="track-desc">Design and ship games using Scratch and Python. For all ages.</p>
          </div>
          <div class="track">
            <span class="track-emoji">🎬</span>
            <p class="track-name">Media Creator</p>
            <p class="track-desc">Video, audio, and content production skills for the digital age.</p>
          </div>
          <div class="track">
            <span class="track-emoji">🎨</span>
            <p class="track-name">Creative Design</p>
            <p class="track-desc">UI/UX, graphics, and visual storytelling for modern platforms.</p>
          </div>
        </div>

      @elseif($nudgeDay === 2)
        <p class="text">
          We know choosing a course is a big decision. So here's what makes Learnexity different from every other platform you've seen:
        </p>
        <ul style="font-size:15px; color:#374151; line-height:2; padding-left:20px;">
          <li>Structured sprint-based curriculum — no aimless watching videos</li>
          <li>Real mentors available for one-on-one and group sessions</li>
          <li>Flexible installment payments — start for as little as ¼ of the course fee</li>
          <li>Scholarships available for students who qualify</li>
          <li>Performance tracking so you always know where you stand</li>
        </ul>

        <div class="proof-box">
          <p>🎓 Students who enroll within the first 3 days of signing up are <strong>3× more likely</strong> to complete their course. Don't let momentum fade.</p>
        </div>

      @else
        <p class="text">
          This is the last email we'll send you about enrolling. We don't want to spam you — but we genuinely believe that the right course can change your career trajectory, and we'd hate for you to miss that.
        </p>
        <p class="text">
          If cost is the barrier, we have installment plans and scholarships. If time is the barrier, our self-paced track works around your schedule. If you're unsure which course to pick, just reply to this email and we'll help you choose.
        </p>
      @endif

      <div class="installment">
        💳 <strong>Installment plan available:</strong> Pay in 4 equal parts. Full access from day one — no waiting until it's fully paid off.
      </div>

      <div class="cta-wrap">
        <a href="{{ $coursesUrl }}" class="btn">Browse Courses & Enroll →</a>
      </div>

      <p class="text" style="font-size:14px; color:#64748b;">
        Questions? Just reply to this email. A real human will respond — usually within a few hours.
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