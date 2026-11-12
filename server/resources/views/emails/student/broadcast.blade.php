{{-- Message an admin sends to students from Admin → Students → Compose Message.
     $bodyHtml is already cleaned by App\Services\StudentEmailContent.
     Inline styles on purpose: Gmail/Outlook/Yahoo drop most <style> rules. --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
  <title>{{ $subject ?? 'Learnexity' }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:2rem 0.75rem 2rem 0.75rem;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          {{-- Brand bar + logo --}}
          <tr><td style="height:6px;background:#4A3AFF;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:28px 40px 20px;border-bottom:1px solid #eef0f4;">
              <a href="{{ $siteUrl }}" target="_blank" rel="noopener" style="text-decoration:none;">
                <img src="{{ $logoUrl }}" alt="Learnexity" width="140" style="display:block;width:140px;max-width:140px;height:auto;border:0;"/>
              </a>
            </td>
          </tr>

          {{-- Message --}}
          <tr>
            <td style="padding:32px 40px 16px;">
              <p style="margin:0 0 20px;font-size:18px;line-height:1.5;font-weight:700;color:#0F172A;">Hello {{ $firstName }},</p>
              {!! $bodyHtml !!}
            </td>
          </tr>

          {{-- Footer --}}
          <tr>
            <td style="padding:22px 40px;background:#f8f9fb;border-top:1px solid #eef0f4;text-align:center;font-size:12px;line-height:1.6;color:#94a3b8;">
              &copy; {{ date('Y') }} Learnexity. All rights reserved.<br/>
              <a href="{{ $siteUrl }}" target="_blank" rel="noopener" style="color:#4A3AFF;text-decoration:none;">learnexity.org</a>
              &nbsp;·&nbsp;
              <a href="mailto:info@learnexity.org" style="color:#4A3AFF;text-decoration:none;">info@learnexity.org</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
