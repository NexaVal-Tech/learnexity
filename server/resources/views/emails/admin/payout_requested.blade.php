{{-- resources/views/emails/admin/payout_requested.blade.php --}}
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <style>
    body { margin:0; padding:0; background:#f4f4f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
    .header { background:linear-gradient(135deg,#0F172A 0%,#1e293b 100%); padding:32px 40px; text-align:center; }
    .header h1 { color:#fff; font-size:20px; font-weight:700; margin:0 0 4px; }
    .header p  { color:#94a3b8; font-size:13px; margin:0; }
    .body { padding:36px 40px; }
    .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; margin-bottom:4px; }
    .value { font-size:15px; color:#0F172A; font-weight:500; margin-bottom:20px; }
    .amount { font-size:28px; font-weight:800; color:#166534; margin:0 0 24px; }
    .badge { display:inline-block; background:#ede9fe; color:#5b21b6; font-size:12px; font-weight:700; padding:3px 10px; border-radius:99px; }
    .divider { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:600; }
    .footer { background:#f8fafc; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>New Payout Request</h1>
      <p>{{ now()->format('D, d M Y · H:i') }} WAT</p>
    </div>

    <div class="body">

        <div class="label">Amount Requested</div>
        <div class="amount">₦{{ number_format((float) $payout->amount, 2) }}</div>

        <div class="label">Referrer</div>
        <div class="value">
            {{ $payeeType === 'user' ? $payee->name : $payee->email }}
            <span class="badge">{{ $payeeType === 'user' ? 'Student' : 'Public Referrer' }}</span>
        </div>

        <div class="label">Email</div>
        <div class="value">{{ $payee->email }}</div>

        <hr class="divider">

        <div class="label">Bank Name</div>
        <div class="value">{{ $payout->bank_name }}</div>

        <div class="label">Account Number</div>
        <div class="value">{{ $payout->account_number }}</div>

        <div class="label">Account Name</div>
        <div class="value">{{ $payout->account_name }}</div>

        <hr class="divider">

        <p style="font-size:14px; color:#475569; line-height:1.6;">
            Review this in the admin dashboard under Referrals → Payout Requests. Once you've sent
            the funds manually via bank transfer, click Approve to record the transaction — the
            referrer will get an email confirmation. If something looks off (e.g. bank details), you
            can Decline instead.
        </p>

    </div>

    <div class="footer">
      Learnexity Internal · This email was sent to the admin team only
    </div>

  </div>
</body>
</html>
