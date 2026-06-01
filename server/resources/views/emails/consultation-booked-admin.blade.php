<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Consultation Booking</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a0f;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                <span style="color:#4A3AFF;">Learnexity</span> Admin
              </p>
            </td>
          </tr>

          <!-- Alert banner -->
          <tr>
            <td style="background:#4A3AFF;padding:14px 40px;">
              <p style="margin:0;color:#ffffff;font-size:14px;font-weight:600;text-align:center;">
                 &nbsp; New Consultation Booking Received
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 24px;font-size:15px;color:#374151;">
                A new consultation has been booked. Here are the details:
              </p>

              <!-- Details table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                @php
                  $typeLabels = [
                    'course_guidance'  => 'Course Guidance',
                    'career_advice'    => 'Career Advice',
                    'technical_support'=> 'Technical Support',
                    'renewal'          => 'Renewal',
                    'general'          => 'General Inquiry',
                  ];
                  $typeLabel = $typeLabels[$consultation->consultation_type] ?? $consultation->consultation_type;
                  $dateFormatted = \Carbon\Carbon::parse($consultation->preferred_date)->format('l, F j, Y');
                @endphp

                @foreach ([
                  ['Student Name',       $consultation->full_name],
                  ['Email',              $consultation->email],
                  ['Phone',              $consultation->phone ?: '—'],
                  ['Course',             $consultation->course ?: '—'],
                  ['Consultation Type',  $typeLabel],
                  ['Date',               $dateFormatted],
                  ['Time',               $consultation->preferred_time],
                ] as $i => [$label, $value])
                <tr style="background:{{ $i % 2 === 0 ? '#f9fafb' : '#ffffff' }};">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;width:170px;border-bottom:1px solid #f3f4f6;">
                    {{ $label }}
                  </td>
                  <td style="padding:12px 16px;font-size:14px;color:#111827;border-bottom:1px solid #f3f4f6;">
                    {{ $value }}
                  </td>
                </tr>
                @endforeach

                @if($consultation->message)
                <tr style="background:#f9fafb;">
                  <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#6b7280;vertical-align:top;">
                    Message
                  </td>
                  <td style="padding:12px 16px;font-size:14px;color:#374151;">
                    {{ $consultation->message }}
                  </td>
                </tr>
                @endif
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="{{ env('ADMIN_URL', env('FRONTEND_URL', 'http://localhost:3000')) }}/admin/consultations"
                       style="display:inline-block;background:#4A3AFF;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;letter-spacing:0.02em;">
                      View in Admin Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                This is an automated notification from Learnexity. Do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>