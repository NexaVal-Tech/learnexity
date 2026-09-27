{{-- resources/views/emails/payout_declined.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#0F172A 0%,#1e293b 100%); padding:32px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:20px; font-weight:700; margin:0 0 4px; }
    .body { padding:36px 40px; }
    .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:4px; }
    .value { font-size:15px; color:#0F172A; font-weight:500; margin-bottom:20px; }
    .note { background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:16px 20px; color:#991b1b; font-size:14px; margin-bottom:20px; }
    .divider { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
    .footer { background:#f8fafc; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>Payout Request Update</h1>
    </div>

    <div class="body">
        <p style="font-size:15px; color:#0F172A; line-height:1.6;">
            We weren't able to process your payout request for
            <strong>₦{{ number_format((float) $payout->amount, 2) }}</strong> this time.
        </p>

        @if($payout->admin_note)
        <div class="note">{{ $payout->admin_note }}</div>
        @endif

        <hr class="divider">

        <div class="label">Details On File</div>
        <div class="value">{{ $payout->bank_name }} · {{ $payout->account_number }} ({{ $payout->account_name }})</div>

        <p style="font-size:14px; color:#475569; line-height:1.6;">
            Your earned balance hasn't been affected — you can update your bank details and submit
            a new payout request any time from your Refer &amp; Earn dashboard.
        </p>
    </div>

    <div class="footer">
      Learnexity Refer &amp; Earn
    </div>

  </div>
</body>
</html>
