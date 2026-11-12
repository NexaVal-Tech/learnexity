{{-- Landing page webinar registration: confirmation (registrant) or notice (team). Inline styles for email apps. --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:2rem 0.75rem 2rem 0.75rem;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
          <tr><td style="height:6px;background:#4A3AFF;font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="padding:28px 40px 20px;border-bottom:1px solid #eef0f4;">
              <img src="{{ $siteUrl }}/images/Logo.png" alt="Learnexity" width="140" style="display:block;width:140px;height:auto;border:0;"/>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 24px;font-size:16px;line-height:1.7;color:#374151;">
              @if($forAdmin)
                <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0F172A;">New webinar registration</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:10px;">
                  @foreach([
                    'Webinar' => $title,
                    'Name' => $r->name,
                    'Email' => $r->email,
                    'Location' => $r->country,
                    'Wants to learn' => $r->interest,
                    'Heard about us' => $r->heard_from,
                    'Registered' => optional($r->created_at)->toDayDateTimeString(),
                  ] as $label => $value)
                    <tr>
                      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:38%;vertical-align:top;">{{ $label }}</td>
                      <td style="padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0F172A;font-weight:600;">{{ $value ?: '—' }}</td>
                    </tr>
                  @endforeach
                </table>
              @else
                <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#0F172A;">Hello {{ $firstName }},</p>
                <p style="margin:0 0 16px;">You're registered for <strong style="color:#0F172A;">{{ $title }}</strong>. We're glad you're joining us!</p>
                @if($when !== '')
                  <p style="margin:0 0 16px;padding:14px 18px;background:#F5F3FF;border-left:4px solid #4A3AFF;border-radius:0 8px 8px 0;"><strong style="color:#0F172A;">When:</strong> {{ $when }}</p>
                @endif
                @if($joinUrl !== '')
                  <p style="margin:24px 0;"><a href="{{ $joinUrl }}" target="_blank" rel="noopener" style="display:inline-block;background:#4A3AFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:9999px;font-weight:600;">Join the webinar</a></p>
                @else
                  <p style="margin:0 0 16px;">We'll email you the joining link before the webinar starts.</p>
                @endif
                <p style="margin:0 0 16px;">Want help choosing the right program for your goals? Our team is one message away.</p>
                <p style="margin:24px 0;"><a href="{{ $whatsappUrl }}" target="_blank" rel="noopener" style="display:inline-block;border:2px solid #4A3AFF;color:#4A3AFF;text-decoration:none;padding:12px 28px;border-radius:9999px;font-weight:600;">{{ $whatsappLabel }} on WhatsApp</a></p>
                <p style="margin:0;">Warm regards,<br/>Team Learnexity</p>
              @endif
            </td>
          </tr>
          <tr>
            <td style="padding:22px 40px;background:#f8f9fb;border-top:1px solid #eef0f4;text-align:center;font-size:12px;line-height:1.6;color:#94a3b8;">
              &copy; {{ date('Y') }} Learnexity. All rights reserved.<br/>
              <a href="{{ $siteUrl }}" style="color:#4A3AFF;text-decoration:none;">learnexity.org</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
