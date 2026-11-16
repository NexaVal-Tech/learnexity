{{-- Scholarship application not successful (admin rejected). Escaped output; inline styles for email apps. --}}
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:2rem 0.75rem 2rem 0.75rem;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="height:6px;background:#4A3AFF;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 40px 20px;border-bottom:1px solid #eef0f4;">
          <img src="{{ $siteUrl }}/images/Logo.png" alt="Learnexity" width="140" style="display:block;width:140px;height:auto;border:0;"/>
        </td></tr>
        <tr><td style="padding:32px 40px 24px;font-size:16px;line-height:1.7;color:#374151;">
          <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0F172A;">Hello {{ $firstName }},</p>
          <p style="margin:0 0 16px;">Thank you for applying for a Learnexity scholarship for <strong style="color:#0F172A;">{{ $course }}</strong> and for the time you put into your answers.</p>
          <p style="margin:0 0 16px;">After careful review, we are not able to offer you a scholarship for this application. We receive many strong applications and places are limited.</p>
          @if($note)
            <p style="margin:0 0 16px;padding:14px 18px;background:#F5F3FF;border-left:4px solid #4A3AFF;border-radius:0 8px 8px 0;white-space:pre-line;">{{ $note }}</p>
          @endif
          <p style="margin:0 0 16px;">This doesn't have to be the end. You are welcome to apply again in the future, and you can still join the program today at the normal price.</p>
          <p style="margin:24px 0;">
            <a href="{{ $courseUrl }}" target="_blank" rel="noopener" style="display:inline-block;background:#4A3AFF;color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:9999px;font-weight:600;">View the course</a>
          </p>
          <p style="margin:0 0 16px;">Questions? <a href="{{ $whatsappUrl }}" target="_blank" rel="noopener" style="color:#4A3AFF;font-weight:600;">Chat with Learnexity on WhatsApp</a>.</p>
          <p style="margin:0;">Warm regards,<br/>Team Learnexity</p>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f8f9fb;border-top:1px solid #eef0f4;text-align:center;font-size:12px;color:#94a3b8;">
          &copy; {{ date('Y') }} Learnexity. All rights reserved. &nbsp;·&nbsp; <a href="{{ $siteUrl }}" style="color:#4A3AFF;text-decoration:none;">learnexity.org</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
