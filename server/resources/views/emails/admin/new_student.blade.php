{{-- resources/views/emails/admin/new_student.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#0F172A 0%,#1e293b 100%); padding:32px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:20px; font-weight:700; margin:0 0 4px; }
    .header p  { color:#94a3b8; font-size:13px; margin:0; }
    .body { padding:36px 40px; }
    .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:4px; }
    .value { font-size:15px; color:#0F172A; font-weight:500; margin-bottom:20px; }
    .badge { display:inline-block; background:#ede9fe; color:#5b21b6; font-size:12px; font-weight:700; padding:3px 10px; border-radius:99px; }
    .badge.no-ref { background:#f1f5f9; color:#64748b; }
    .divider { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:600; }
    .footer { background:#f8fafc; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>New Student Registered</h1>
      <p>{{ now()->format('D, d M Y · H:i') }} WAT</p>
    </div>

    <div class="body">

      <div class="label">Full Name</div>
      <div class="value">{{ $user->name }}</div>

      <div class="label">Email Address</div>
      <div class="value">{{ $user->email }}</div>

      @if($user->phone)
        <div class="label">Phone</div>
        <div class="value">{{ $user->phone }}</div>
      @endif

      <div class="label">Referral Code Used</div>
      <div class="value">
        @if($referralCode)
          <span class="badge">{{ $referralCode }}</span>
        @else
          <span class="badge no-ref">None</span>
        @endif
      </div>

      <div class="label">Registered At</div>
      <div class="value">{{ $user->created_at->setTimezone('Africa/Lagos')->format('D, d M Y · H:i') }} WAT</div>

      <hr class="divider"/>

      <p style="text-align:center; margin:0;">
        <a href="{{ env('FRONTEND_URL','https://learnexity.org') }}/admin/students" class="btn">View in Admin Panel →</a>
      </p>
    </div>

    <div class="footer">
      Learnexity Internal · This email was sent to the admin team only
    </div>

  </div>
</body>
</html>