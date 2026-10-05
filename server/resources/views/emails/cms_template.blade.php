{{-- resources/views/emails/cms_template.blade.php
     Branded layout for emails whose text was customised in Website CMS → Emails.
     $heading, $bodyHtml (already escaped/sanitised), $buttonLabel, $buttonUrl, $details --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { padding:36px 40px; text-align:center; background:linear-gradient(135deg,#2e1065 0%,#4A3AFF 100%); }
    .brand { color:rgba(255,255,255,0.8); font-size:13px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; margin:0 0 10px; }
    .header h1 { color:#fff; font-size:22px; font-weight:800; margin:0; line-height:1.35; }
    .body { padding:36px 40px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 16px; }
    .text strong { color:#0F172A; }
    .details { border:1px solid #e2e8f0; border-radius:10px; padding:8px 20px; margin:24px 0; }
    .row { width:100%; font-size:14px; color:#374151; border-bottom:1px solid #f1f5f9; }
    .row:last-child { border-bottom:none; }
    .row td { padding:10px 0; }
    .row td.v { text-align:right; font-weight:700; color:#0F172A; }
    .cta-wrap { text-align:center; margin:28px 0 8px; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff !important; text-decoration:none; padding:14px 40px; border-radius:8px; font-size:16px; font-weight:700; }
    .footer { background:#f8fafc; padding:24px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#4A3AFF; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="brand">Learnexity</p>
      <h1>{{ $heading }}</h1>
    </div>

    <div class="body">
      {!! $bodyHtml !!}

      @if(!empty($details))
        <div class="details">
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">
            @foreach($details as $label => $value)
              <tr class="row"><td>{{ $label }}</td><td class="v">{{ $value }}</td></tr>
            @endforeach
          </table>
        </div>
      @endif

      @if(!empty($buttonLabel) && !empty($buttonUrl))
        <div class="cta-wrap">
          <a href="{{ $buttonUrl }}" class="btn">{{ $buttonLabel }}</a>
        </div>
      @endif
    </div>

    <div class="footer">
      &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp;
      <a href="{{ config('app.frontend_url', env('FRONTEND_URL', 'https://learnexity.org')) }}">learnexity.org</a>
    </div>
  </div>
</body>
</html>
