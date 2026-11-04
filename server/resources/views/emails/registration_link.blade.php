{{-- resources/views/emails/registration_link.blade.php --}}
<!DOCTYPE html>
<html>
<body style="font-family: 'DM Sans', Arial, sans-serif; background:#f5f5f7; padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    <h2 style="color:#4A3AFF;margin-bottom:8px;">Verify your email</h2>
    <p style="color:#333;line-height:1.6;">Thanks for joining Learnexity! Click the button below to verify your email and create your password.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="{{ $url }}" style="display:inline-block;background:#4A3AFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:16px;">Verify email</a>
    </div>
    <p style="color:#888;font-size:13px;line-height:1.6;">This link works for 24 hours. If you don't finish now, you can come back and use the same link any time within 24 hours.</p>
    <p style="color:#888;font-size:12px;line-height:1.6;word-break:break-all;">If the button doesn't work, copy this link into your browser:<br>{{ $url }}</p>
    <p style="color:#aaa;font-size:12px;">If you didn't sign up for Learnexity, you can ignore this email.</p>
  </div>
</body>
</html>
