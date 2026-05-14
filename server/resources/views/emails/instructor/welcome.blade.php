<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{ $isReset ? 'Password Reset' : 'Welcome to Learnexity' }}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%); padding: 40px 40px 32px; text-align: center; }
    .header img { height: 36px; margin-bottom: 16px; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
    .header p  { color: #94a3b8; font-size: 14px; margin: 8px 0 0; }
    .body { padding: 40px; }
    .greeting { font-size: 18px; font-weight: 600; color: #0F172A; margin-bottom: 12px; }
    .text { font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 16px; }
    .credentials { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 24px; margin: 24px 0; }
    .cred-row { display: flex; align-items: center; margin-bottom: 12px; }
    .cred-row:last-child { margin-bottom: 0; }
    .cred-label { font-size: 12px; font-weight: 600; text-transform: uppercase; color: #64748b; width: 90px; flex-shrink: 0; }
    .cred-value { font-size: 15px; font-weight: 600; color: #0F172A; font-family: 'Courier New', monospace; }
    .btn { display: inline-block; background: #4A3AFF; color: #ffffff; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0; }
    .notice { background: #fefce8; border-left: 4px solid #eab308; padding: 14px 16px; border-radius: 0 8px 8px 0; font-size: 14px; color: #713f12; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 24px 40px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>{{ $isReset ? 'Password Reset' : 'Welcome, Instructor!' }}</h1>
      <p>Learnexity Instructor Portal</p>
    </div>

    <div class="body">
      <p class="greeting">Hi {{ $instructor->name }},</p>

      @if($isReset)
        <p class="text">Your Learnexity instructor account password has been reset by an administrator. Use the credentials below to log in:</p>
      @else
        <p class="text">You've been added as an instructor on <strong>Learnexity</strong>. Your account is ready — use the credentials below to log in and start managing your courses.</p>
      @endif

      <div class="credentials">
        <div class="cred-row">
          <span class="cred-label">Login URL</span>
          <span class="cred-value">{{ config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')) }}/instructors/auth/login</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Email</span>
          <span class="cred-value">{{ $instructor->email }}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Password</span>
          <span class="cred-value">{{ $plainPassword }}</span>
        </div>
      </div>

      <p style="text-align:center; margin: 28px 0;">
        <a href="{{ env('FRONTEND_URL', 'https://learnexity.org') }}/instructors/auth/login" class="btn">
          Log In to Instructor Portal →
        </a>
      </p>

      <div class="notice">
        Please change your password after your first login. Do not share these credentials with anyone.
      </div>

      <p class="text">If you have any questions, reply to this email or contact the Learnexity admin team.</p>
      <p class="text">Welcome aboard! </p>
    </div>

    <div class="footer">
      © {{ date('Y') }} Learnexity · <a href="{{ env('FRONTEND_URL') }}" style="color:#4A3AFF;">learnexity.org</a><br/>
      This email was sent because an admin created your instructor account.
    </div>
  </div>
</body>
</html>