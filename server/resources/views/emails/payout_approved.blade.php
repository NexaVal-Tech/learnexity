{{-- resources/views/emails/payout_approved.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#166534 0%,#15803d 100%); padding:32px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:20px; font-weight:700; margin:0 0 4px; }
    .body { padding:36px 40px; }
    .amount { font-size:32px; font-weight:800; color:#166534; margin:0 0 24px; text-align:center; }
    .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:4px; }
    .value { font-size:15px; color:#0F172A; font-weight:500; margin-bottom:20px; }
    .divider { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
    .footer { background:#f8fafc; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>💸 Payout Sent</h1>
    </div>

    <div class="body">
        <p style="font-size:15px; color:#0F172A; line-height:1.6;">
            Good news — your Refer &amp; Earn payout has been sent.
        </p>

        <div class="amount">₦{{ number_format((float) $payout->amount, 2) }}</div>

        <hr class="divider">

        <div class="label">Sent To</div>
        <div class="value">{{ $payout->bank_name }} · {{ $payout->account_number }} ({{ $payout->account_name }})</div>

        <div class="label">Date</div>
        <div class="value">{{ optional($payout->processed_at)->setTimezone('Africa/Lagos')->format('d M Y, h:i A') }}</div>

        @if($payout->admin_note)
        <div class="label">Note</div>
        <div class="value">{{ $payout->admin_note }}</div>
        @endif

        <p style="font-size:13px; color:#64748b; line-height:1.6;">
            This was sent as a manual bank transfer, so it may take a little time to reflect
            depending on your bank. Keep sharing your referral link to keep earning!
        </p>
    </div>

    <div class="footer">
      Learnexity Refer &amp; Earn
    </div>

  </div>
</body>
</html>
