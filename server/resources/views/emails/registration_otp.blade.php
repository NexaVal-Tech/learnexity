{{-- resources/views/emails/registration_otp.blade.php --}}
<!DOCTYPE html>
<html>
<body style="font-family: 'DM Sans', Arial, sans-serif; background:#f5f5f7; padding:32px;">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    <h2 style="color:#4A3AFF;margin-bottom:8px;">Verify your email</h2>
    <p style="color:#333;">Use this code to complete your Learnexity registration:</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#4A3AFF;text-align:center;margin:24px 0;">
      {{ $otp }}
    </div>
    <p style="color:#888;font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
  </div>
</body>
</html>