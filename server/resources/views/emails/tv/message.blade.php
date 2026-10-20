{{-- Shared design for Learnexity TV webinar emails --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { padding:36px 40px; text-align:center; background:linear-gradient(135deg,#0B1120 0%,#6D28D9 100%); }
    .eyebrow { color:#C4B5FD; font-size:12px; letter-spacing:.12em; text-transform:uppercase; margin:0 0 8px; }
    .header h1 { color:#fff; font-size:22px; font-weight:800; margin:0; }
    .body { padding:36px 40px; }
    .greeting { font-size:18px; font-weight:700; color:#0F172A; margin:0 0 12px; }
    .text { font-size:15px; color:#374151; line-height:1.7; margin:0 0 14px; }
    .box { border:1px solid #e5e7eb; border-radius:10px; padding:14px 18px; margin:18px 0; }
    .row { font-size:14px; color:#374151; margin:4px 0; }
    .row strong { color:#0F172A; }
    .cta-wrap { text-align:center; margin:26px 0 8px; }
    .btn { display:inline-block; background:#6D28D9; color:#fff !important; text-decoration:none; padding:14px 36px; border-radius:8px; font-size:16px; font-weight:700; }
    .btn-wa { background:#25D366; }
    .small { font-size:13px; color:#64748b; line-height:1.6; }
    .footer { background:#f8fafc; padding:22px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
    .footer a { color:#6D28D9; text-decoration:none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p class="eyebrow">Learnexity TV</p>
      <h1>{{ $heading }}</h1>
    </div>
    <div class="body">
      <p class="greeting">Hi {{ $firstName }},</p>
      @foreach($paragraphs as $p)
        <p class="text">{{ $p }}</p>
      @endforeach

      @if(!empty($details))
        <div class="box">
          @foreach($details as $label => $value)
            <p class="row">{{ $label }}: <strong>{{ $value }}</strong></p>
          @endforeach
        </div>
      @endif

      @if(!empty($buttonUrl))
        <div class="cta-wrap"><a href="{{ $buttonUrl }}" class="btn">{{ $buttonLabel }}</a></div>
      @endif

      @if(!empty($whatsappUrl))
        <div class="cta-wrap"><a href="{{ $whatsappUrl }}" class="btn btn-wa">Chat with us on WhatsApp</a></div>
      @endif

      <p class="small" style="margin-top:24px;">Questions? Reply to this email or write to info@learnexity.org.</p>
    </div>
    <div class="footer">
      &copy; {{ date('Y') }} Learnexity &nbsp;·&nbsp; <a href="{{ config('app.tv_url') }}">tv.learnexity.org</a>
    </div>
  </div>
</body>
</html>
