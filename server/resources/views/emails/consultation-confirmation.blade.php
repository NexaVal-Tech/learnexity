<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Consultation Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a0f;padding:28px 40px;text-align:center;">
              <p style="margin:0;font-size:24px;font-weight:700;color:#ffffff;">
                <span style="color:#4A3AFF;">Learnexity</span>
              </p>
            </td>
          </tr>

          <!-- Success banner -->
          <tr>
            <td style="padding:36px 40px 20px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="width:64px;height:64px;background:#ede9ff;border-radius:50%;text-align:center;vertical-align:middle;font-size:28px;">
                    ✅
                  </td>
                </tr>
              </table>
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;">
                Your Consultation is Confirmed!
              </h1>
              <p style="margin:0;font-size:15px;color:#6b7280;">
                Hi {{ $consultation->full_name }}, we've received your booking. Here's a summary:
              </p>
            </td>
          </tr>

          <!-- Details card -->
          <tr>
            <td style="padding:0 40px 32px;">
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

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                <!-- Date highlight -->
                <tr>
                  <td colspan="2" style="background:#4A3AFF;padding:16px 20px;text-align:center;">
                    <p style="margin:0;font-size:16px;font-weight:700;color:#ffffff;">
                      {{ $dateFormatted }}
                    </p>
                    <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#c7c0ff;">
                      {{ $consultation->preferred_time }}
                    </p>
                  </td>
                </tr>

                @foreach ([
                  ['Type',   $typeLabel],
                  ['Course', $consultation->course ?: '—'],
                ] as $i => [$label, $value])
                <tr>
                  <td style="padding:12px 20px;font-size:13px;font-weight:600;color:#6b7280;width:130px;border-bottom:1px solid #e5e7eb;">
                    {{ $label }}
                  </td>
                  <td style="padding:12px 20px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">
                    {{ $value }}
                  </td>
                </tr>
                @endforeach
              </table>

              <!-- What's next -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e;">
                      What happens next?
                    </p>
                    <p style="margin:0;font-size:13px;color:#78350f;line-height:1.6;">
                      Our team will review your booking and send you a meeting link before your scheduled time.
                      If you need to reschedule or have questions, reply to this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#374151;">
                Questions? Email us at
                <a href="mailto:{{ env('MAIL_FROM_ADDRESS') }}" style="color:#4A3AFF;text-decoration:none;">
                  {{ env('MAIL_FROM_ADDRESS') }}
                </a>
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                {{ date('Y') }} Learnexity. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>