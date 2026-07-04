{{-- resources/views/emails/admin/new_student.blade.php --}}
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
    .badge { display:inline-block; background:#ede9fe; color:#5b21b6; font-size:12px; font-weight:700; padding:3px 10px; border-radius:99px; }
    .badge.no-ref { background:#f1f5f9; color:#64748b; }
    .divider { border:none; border-top:1px solid #e2e8f0; margin:24px 0; }
    .btn { display:inline-block; background:#4A3AFF; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-size:14px; font-weight:600; }
    .footer { background:#f8fafc; padding:20px 40px; text-align:center; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="wrapper">

    <div class="header">
      <h1>New Student Registered</h1>
      <p>{{ now()->format('D, d M Y · H:i') }} WAT</p>
    </div>

    <div class="body">

        <div class="label">Student Name</div>
        <div class="value">{{ $user->name }}</div>

        <div class="label">Email</div>
        <div class="value">{{ $user->email }}</div>

        @if($user->phone)
        <div class="label">Phone</div>
        <div class="value">{{ $user->phone }}</div>
        @endif

        <div class="label">Course</div>
        <div class="value">{{ $enrollment->course_name }}</div>

        <div class="label">Course ID</div>
        <div class="value">{{ $enrollment->course_id }}</div>

        <div class="label">Learning Track</div>
        <div class="value">{{ ucfirst(str_replace('_',' ', $enrollment->learning_track)) }}</div>

        <div class="label">Payment Type</div>
        <div class="value">{{ ucfirst($enrollment->payment_type) }}</div>

        <div class="label">Payment Status</div>
        <div class="value">
            @if($enrollment->payment_status == 'completed')
                <span class="badge" style="background:#dcfce7;color:#166534;">
                    Completed
                </span>
            @elseif($enrollment->payment_status == 'pending')
                <span class="badge" style="background:#fef9c3;color:#854d0e;">
                    Pending
                </span>
            @else
                <span class="badge" style="background:#fee2e2;color:#991b1b;">
                    {{ ucfirst($enrollment->payment_status) }}
                </span>
            @endif
        </div>

        <div class="label">Currency</div>
        <div class="value">{{ $enrollment->currency }}</div>

        <div class="label">Course Price</div>
        <div class="value">
            {{ $enrollment->currency }}
            {{ number_format($enrollment->total_amount,2) }}
        </div>

        <div class="label">Amount Paid</div>
        <div class="value">
            {{ $enrollment->currency }}
            {{ number_format($enrollment->amount_paid,2) }}
        </div>

        <div class="label">Installments Paid</div>
        <div class="value">
            {{ $enrollment->installments_paid }}
            / {{ $enrollment->total_installments }}
        </div>

        @if($enrollment->transaction_id)
        <div class="label">Transaction ID</div>
        <div class="value">{{ $enrollment->transaction_id }}</div>
        @endif

        @if($enrollment->payment_date)
        <div class="label">Payment Date</div>
        <div class="value">
            {{ $enrollment->payment_date->setTimezone('Africa/Lagos')->format('d M Y, h:i A') }}
        </div>
        @endif

        @if($enrollment->next_payment_due)
        <div class="label">Next Payment Due</div>
        <div class="value">
            {{ $enrollment->next_payment_due->setTimezone('Africa/Lagos')->format('d M Y, h:i A') }}
        </div>
        @endif

        <div class="label">Access Granted</div>
        <div class="value">
            {{ $enrollment->has_access ? 'Yes' : 'No' }}
        </div>

        <div class="label">Enrollment Time</div>
        <div class="value">
            {{ $enrollment->enrollment_date->setTimezone('Africa/Lagos')->format('d M Y, h:i A') }}
        </div>

        <div class="label">Referral Code</div>
        <div class="value">
            {{ $referralCode ?? 'None' }}
        </div>

    <div class="footer">
      Learnexity Internal · This email was sent to the admin team only
    </div>

  </div>
</body>
</html>