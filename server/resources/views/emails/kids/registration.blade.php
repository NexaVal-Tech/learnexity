<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <title>Registration Confirmed — Learnexity Kids</title>
  <style>
    * { box-sizing: border-box; }
    body, html { margin: 0; padding: 0; width: 100% !important; }
    body { background-color: #f1f5f9; font-family: Arial, Helvetica, sans-serif; color: #1e293b; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    a { text-decoration: none; }
    @media only screen and (max-width: 620px) {
      .wrapper { width: 100% !important; border-radius: 0 !important; }
      .body-pad { padding: 28px 20px !important; }
      .header-pad { padding: 32px 20px 28px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9;">

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;">
  <tr>
    <td align="center" style="padding: 32px 16px;">

      <!-- Email card -->
      <table class="wrapper" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- ══ HEADER ══ -->
        <tr>
          <td class="header-pad" style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1040 100%); padding:40px 40px 32px; text-align:center;">
            <p style="margin:0 0 20px; font-size:12px; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.5); font-family:Arial,sans-serif;">
              Learnexity · Kids Programme
            </p>
            <p style="margin:0 0 14px; font-size:48px; line-height:1;">🎓</p>
            <h1 style="margin:0; font-size:26px; font-weight:900; color:#ffffff; line-height:1.2; font-family:Arial,sans-serif;">
              Registration <span style="color:#f59e0b;">Confirmed!</span>
            </h1>
            <p style="margin:10px 0 0; font-size:14px; color:rgba(255,255,255,0.55); line-height:1.6; font-family:Arial,sans-serif;">
              One step away — complete your payment to secure {{ $enrollment->student_name }}'s spot.
            </p>
          </td>
        </tr>

        <!-- ══ BODY ══ -->
        <tr>
          <td class="body-pad" style="padding:36px 40px;">

            <!-- Greeting -->
            <p style="margin:0 0 24px; font-size:15px; color:#475569; line-height:1.7; font-family:Arial,sans-serif;">
              Hi <strong style="color:#1e293b;">{{ $enrollment->parent_name }}</strong>, great news 
              <strong style="color:#1e293b;">{{ $enrollment->student_name }}'s</strong> enrollment has been registered.
              Your spot is reserved, but please complete payment within <strong style="color:#1e293b;">48 hours</strong> to confirm it.
            </p>

            <!-- ── Enrollment Summary Card ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8fafc; border-radius:16px; border:1px solid #e2e8f0; margin-bottom:24px;">

              <!-- Card header -->
              <tr>
                <td style="background-color:#f0eeff; padding:16px 20px; border-bottom:1px solid #e2e8f0; border-radius:16px 16px 0 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="48" valign="middle" style="font-size:28px; line-height:1;">
                        {{ $enrollment->course?->emoji ?? '📚' }}
                      </td>
                      <td valign="middle" style="padding-left:12px;">
                        <p style="margin:0; font-size:15px; font-weight:800; color:#1e293b; font-family:Arial,sans-serif;">
                          {{ $enrollment->course?->name ?? 'Kids Programme' }}
                        </p>
                        <p style="margin:2px 0 0; font-size:12px; color:#94a3b8; font-family:Arial,sans-serif;">
                          3 month programme · Ages 10–17
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Card rows -->
              <tr>
                <td style="padding:0 20px;">

                  <!-- Student -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; font-family:Arial,sans-serif;">Student</td>
                            <td align="right" style="font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">{{ $enrollment->student_name }}, age {{ $enrollment->student_age }}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Track -->
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; font-family:Arial,sans-serif;">Track</td>
                            <td align="right" style="font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">{{ $trackName }}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Session Format -->
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; font-family:Arial,sans-serif;">Session Format</td>
                            <td align="right" style="font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">{{ $sessionType }}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Payment Plan -->
                    <tr>
                      <td style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; font-family:Arial,sans-serif;">Payment Plan</td>
                            <td align="right" style="font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">{{ $paymentType }}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Total -->
                    <tr>
                      <td style="padding:12px 0; {{ $enrollment->payment_type === 'installment' ? 'border-bottom:1px solid #f1f5f9;' : '' }}">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; font-family:Arial,sans-serif;">Total</td>
                            <td align="right" style="font-size:15px; font-weight:800; color:#4A3AFF; font-family:Arial,sans-serif;">
                              @if($enrollment->currency === 'NGN')
                                ₦{{ number_format($enrollment->total_price, 0, '.', ',') }}
                              @else
                                ${{ number_format($enrollment->total_price, 0, '.', ',') }}
                              @endif
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Due Today (installment only) -->
                    @if($enrollment->payment_type === 'installment')
                    @php
                      $installmentAmount = $enrollment->nextInstallmentAmount();
                      if (!$installmentAmount || $installmentAmount <= 0) {
                          $installmentAmount = $enrollment->total_installments > 0
                              ? round($enrollment->total_price / $enrollment->total_installments, 2)
                              : $enrollment->total_price;
                      }
                    @endphp
                    <tr>
                      <td style="padding:12px 0 4px;">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#94a3b8; font-family:Arial,sans-serif;">Due Today</td>
                            <td align="right" style="font-family:Arial,sans-serif;">
                              <span style="font-size:13px; font-weight:800; color:#22c55e;">
                                @if($enrollment->currency === 'NGN')
                                  ₦{{ number_format($installmentAmount, 0, '.', ',') }}
                                @else
                                  ${{ number_format($installmentAmount, 2, '.', ',') }}
                                @endif
                              </span>
                              <span style="font-size:12px; color:#94a3b8; font-weight:500;"> (1 of {{ $enrollment->total_installments }})</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    @endif

                  </table>
                </td>
              </tr>
            </table>
            <!-- ── End Enrollment Card ── -->

            <!-- ── CTA Button ── -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
              <tr>
                <td align="center" style="padding:4px 0 10px;">
                  <a href="{{ $paymentUrl }}"
                     style="display:inline-block; padding:16px 44px; background-color:#4A3AFF; color:#ffffff; font-size:15px; font-weight:800; text-decoration:none; border-radius:40px 12px 40px 12px; font-family:Arial,sans-serif; mso-padding-alt:16px 44px;">
                    Complete Payment &rarr;
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <p style="margin:0; font-size:12px; color:#94a3b8; font-family:Arial,sans-serif;">
                    Spot held for 48 hours ·
                    {{ $enrollment->currency === 'USD' ? 'Powered by Stripe' : 'Powered by Paystack' }}
                  </p>
                </td>
              </tr>
            </table>

            <!-- ── What Happens Next ── -->
            <p style="margin:0 0 12px; font-size:12px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; color:#94a3b8; font-family:Arial,sans-serif;">
              What Happens Next
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">

              <!-- Step 1 -->
              <tr>
                <td style="padding:14px 0; border-bottom:1px solid #f1f5f9;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="36" valign="top">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td width="28" height="28" align="center" valign="middle"
                                style="background-color:#4A3AFF; border-radius:50%; font-size:12px; font-weight:800; color:#ffffff; font-family:Arial,sans-serif; line-height:28px; text-align:center;">
                              <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:28px;v-text-anchor:middle;width:28px;" arcsize="50%" stroke="f" fillcolor="#4A3AFF"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;font-size:12px;font-weight:800;">1</center></v:roundrect><![endif]-->
                              <!--[if !mso]><!--><span style="display:inline-block; width:28px; height:28px; background-color:#4A3AFF; border-radius:50%; font-size:12px; font-weight:800; color:#ffffff; font-family:Arial,sans-serif; line-height:28px; text-align:center;">1</span><!--<![endif]-->
                            </td>
                          </tr>
                        </table>
                      </td>
                      <td style="padding-left:14px;" valign="top">
                        <p style="margin:0 0 3px; font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">Complete your payment</p>
                        <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5; font-family:Arial,sans-serif;">Use the button above. It takes less than 2 minutes.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Step 2 — WhatsApp -->
              <tr>
                <td style="padding:14px 0; border-bottom:1px solid #f1f5f9;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="36" valign="top">
                        <span style="display:inline-block; width:28px; height:28px; background-color:#4A3AFF; border-radius:50%; font-size:12px; font-weight:800; color:#ffffff; font-family:Arial,sans-serif; line-height:28px; text-align:center;">2</span>
                      </td>
                      <td style="padding-left:14px;" valign="top">
                        <p style="margin:0 0 3px; font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">Join our parent community</p>
                        <p style="margin:0 0 10px; font-size:12px; color:#94a3b8; line-height:1.5; font-family:Arial,sans-serif;">
                          Stay updated with schedules, session reminders, and announcements for {{ $enrollment->student_name }}'s cohort.
                        </p>
                        <!-- WhatsApp CTA -->
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="background-color:#25D366; border-radius:20px 6px 20px 6px;">
                              <a href="https://chat.whatsapp.com/BV3fBRuYiwpIqJ6T3QL9T9?mode=gi_t"
                                 style="display:inline-block; padding:9px 18px; color:#ffffff; font-size:12px; font-weight:800; text-decoration:none; font-family:Arial,sans-serif; white-space:nowrap;">
                                <!-- WhatsApp SVG icon inline -->
                                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                                     width="14" height="14"
                                     alt=""
                                     style="vertical-align:middle; margin-right:6px; display:inline-block; border:0;" />
                                Join Our Closed Group
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Step 3 -->
              <tr>
                <td style="padding:14px 0; border-bottom:1px solid #f1f5f9;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="36" valign="top">
                        <span style="display:inline-block; width:28px; height:28px; background-color:#4A3AFF; border-radius:50%; font-size:12px; font-weight:800; color:#ffffff; font-family:Arial,sans-serif; line-height:28px; text-align:center;">3</span>
                      </td>
                      <td style="padding-left:14px;" valign="top">
                        <p style="margin:0 0 3px; font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">We'll reach out within 24 hours</p>
                        <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5; font-family:Arial,sans-serif;">
                          Our team will contact you to schedule {{ $enrollment->student_name }}'s first session.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Step 4 -->
              <tr>
                <td style="padding:14px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td width="36" valign="top">
                        <span style="display:inline-block; width:28px; height:28px; background-color:#4A3AFF; border-radius:50%; font-size:12px; font-weight:800; color:#ffffff; font-family:Arial,sans-serif; line-height:28px; text-align:center;">4</span>
                      </td>
                      <td style="padding-left:14px;" valign="top">
                        <p style="margin:0 0 3px; font-size:13px; font-weight:700; color:#1e293b; font-family:Arial,sans-serif;">Learning begins 🚀</p>
                        <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5; font-family:Arial,sans-serif;">
                          {{ $enrollment->student_name }} starts building real digital skills with expert mentorship.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
            <!-- ── End Steps ── -->

            <p style="margin:0; font-size:13px; color:#475569; line-height:1.7; font-family:Arial,sans-serif;">
              If you have any questions, just reply to this email or contact us at
              <a href="mailto:info@learnexity.org" style="color:#4A3AFF; font-weight:600; text-decoration:none;">info@learnexity.org</a>.
            </p>

          </td>
        </tr>

        <!-- ══ FOOTER ══ -->
        <tr>
          <td style="background-color:#f8fafc; padding:28px 40px; text-align:center; border-top:1px solid #e2e8f0;">
            <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.7; font-family:Arial,sans-serif;">
              Learnexity · Kids Digital Skills Programme<br />
              <a href="{{ config('app.frontend_url') }}/kids" style="color:#4A3AFF; font-weight:600; text-decoration:none;">learnexity.org/kids</a> ·
              <a href="mailto:info@learnexity.org" style="color:#4A3AFF; font-weight:600; text-decoration:none;">info@learnexity.org</a>
            </p>
            <p style="margin:12px 0 0; font-size:11px; color:#cbd5e1; font-family:Arial,sans-serif;">
              You're receiving this because you registered at Learnexity.
              Enrollment ID: #{{ $enrollment->id }}
            </p>
          </td>
        </tr>

      </table>
      <!-- End email card -->

    </td>
  </tr>
</table>

</body>
</html>