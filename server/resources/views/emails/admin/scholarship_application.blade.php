{{-- New scholarship application → admin team. Everything printed escaped ({{ }}); inline styles for email apps. --}}
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:2rem 0.75rem 2rem 0.75rem;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="height:6px;background:#4A3AFF;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 40px 8px;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#4A3AFF;font-weight:700;">Scholarship application — needs review</p>
          <p style="margin:0;font-size:20px;line-height:1.35;font-weight:700;color:#0F172A;">{{ $name }} applied for {{ $course }}</p>
          <p style="margin:6px 0 0;font-size:14px;color:#64748b;">{{ $email }}</p>
        </td></tr>
        <tr><td style="padding:16px 40px;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:1px solid #e5e7eb;border-radius:10px;">
            @foreach($details as $label => $value)
              <tr>
                <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b;width:40%;">{{ $label }}</td>
                <td style="padding:9px 14px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#0F172A;font-weight:600;">{{ $value }}</td>
              </tr>
            @endforeach
          </table>
        </td></tr>
        <tr><td style="padding:8px 40px;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0F172A;">Why should we give them the scholarship?</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151;white-space:pre-line;">{{ $why }}</p>
          <p style="margin:0 0 6px;font-size:14px;font-weight:700;color:#0F172A;">Long-term goal after graduation</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151;white-space:pre-line;">{{ $goal }}</p>
        </td></tr>
        <tr><td style="padding:4px 40px 32px;">
          <a href="{{ $reviewUrl }}" target="_blank" rel="noopener" style="display:inline-block;background:#4A3AFF;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:9999px;font-size:16px;font-weight:600;">Review in admin — approve or reject</a>
        </td></tr>
        <tr><td style="padding:20px 40px;background:#f8f9fb;border-top:1px solid #eef0f4;text-align:center;font-size:12px;color:#94a3b8;">
          &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp; <a href="{{ $siteUrl }}" style="color:#4A3AFF;text-decoration:none;">learnexity.org</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
