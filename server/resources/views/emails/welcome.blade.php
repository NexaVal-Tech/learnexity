<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to Learnexity 🎉</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb; }
    a { color: inherit; text-decoration: none; }
    img { border: 0; display: block; }

    /* Shimmer animation for email clients that support it */
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
  </style>
</head>
<body style="background-color:#f9fafb; padding: 40px 16px;">

  <!-- ═══════════════════════════════════════════════════════ -->
  <!--  OUTER WRAPPER                                          -->
  <!-- ═══════════════════════════════════════════════════════ -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">

        <!-- ─── CARD ─────────────────────────────────────────── -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px; width:100%; background:#ffffff; border-radius:24px;
                      box-shadow:0 25px 50px rgba(0,0,0,0.10); overflow:hidden;">

          <!-- ╔═══════════════════════════════════════════════╗ -->
          <!-- ║  TOP GRADIENT BAR                             ║ -->
          <!-- ╚═══════════════════════════════════════════════╝ -->
          <tr>
            <td style="height:6px; background:linear-gradient(90deg, #3b82f6, #8b5cf6, #22c55e); line-height:6px; font-size:6px;">&nbsp;</td>
          </tr>

          <!-- ╔═══════════════════════════════════════════════╗ -->
          <!-- ║  HERO HEADER                                  ║ -->
          <!-- ╚═══════════════════════════════════════════════╝ -->
          <tr>
            <td align="center"
                style="background:linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 50%, #312e81 100%);
                       padding: 48px 40px 40px;">

              <!-- Logo / Brand name -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom: 28px;">
                    <!-- Icon badge -->
                    <div style="display:inline-block; background:rgba(255,255,255,0.12);
                                border:1px solid rgba(255,255,255,0.2); border-radius:16px;
                                padding:12px 24px;">
                      <span style="font-size:28px; font-weight:800; color:#ffffff;
                                   letter-spacing:-0.5px;">
                        Learn<span style="color:#60a5fa;">exity</span>
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <!-- Celebration emoji ring -->
                    <div style="font-size:52px; margin-bottom:20px; line-height:1;">🎉</div>

                    <h1 style="font-size:32px; font-weight:800; color:#ffffff; margin:0 0 12px;
                                line-height:1.2; letter-spacing:-0.5px;">
                      You're officially in!
                    </h1>
                    <p style="font-size:17px; color:rgba(255,255,255,0.75); margin:0;
                               line-height:1.6; max-width:400px;">
                      Welcome to Learnexity, {{ $user->name }}. Your account is verified
                      and your learning journey starts right now.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ╔═══════════════════════════════════════════════╗ -->
          <!-- ║  MAIN BODY                                    ║ -->
          <!-- ╚═══════════════════════════════════════════════╝ -->
          <tr>
            <td style="padding: 40px 40px 0;">

              <!-- Greeting -->
              <p style="font-size:16px; color:#374151; line-height:1.7; margin:0 0 28px;">
                Hey <strong style="color:#111827;">{{ $user->name }}</strong>, we're genuinely
                thrilled to have you here. Learnexity was built for people exactly like you —
                driven, curious, and ready to build real skills that open real doors.
              </p>

              <!-- ─────────────────────────────────────────── -->
              <!--  3 VALUE CARDS (mirrors landing page cards) -->
              <!-- ─────────────────────────────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="margin-bottom: 32px;">
                <tr>
                  <!-- Card 1: Real Projects (blue) -->
                  <td width="33%" valign="top" style="padding-right:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:linear-gradient(135deg,#eff6ff,#f0f9ff);
                                  border:1px solid #bfdbfe; border-radius:16px; overflow:hidden;">
                      <tr>
                        <td style="padding:20px 16px; text-align:center;">
                          <div style="width:44px; height:44px; border-radius:12px;
                                      background:linear-gradient(135deg,#3b82f6,#2563eb);
                                      margin:0 auto 12px; line-height:44px; text-align:center;
                                      font-size:20px;">
                            📄
                          </div>
                          <p style="font-size:13px; font-weight:700; color:#1e3a8a; margin:0 0 6px;">
                            Real Projects
                          </p>
                          <p style="font-size:12px; color:#4b5563; line-height:1.5; margin:0;">
                            Build a portfolio employers actually care about
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Card 2: 1-on-1 Mentorship (purple) -->
                  <td width="33%" valign="top" style="padding: 0 4px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:linear-gradient(135deg,#f5f3ff,#fdf4ff);
                                  border:1px solid #ddd6fe; border-radius:16px; overflow:hidden;">
                      <tr>
                        <td style="padding:20px 16px; text-align:center;">
                          <div style="width:44px; height:44px; border-radius:12px;
                                      background:linear-gradient(135deg,#8b5cf6,#7c3aed);
                                      margin:0 auto 12px; line-height:44px; text-align:center;
                                      font-size:20px;">
                            👥
                          </div>
                          <p style="font-size:13px; font-weight:700; color:#4c1d95; margin:0 0 6px;">
                            1-on-1 Mentorship
                          </p>
                          <p style="font-size:12px; color:#4b5563; line-height:1.5; margin:0;">
                            Learn directly from industry professionals
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Card 3: Career Support (green) -->
                  <td width="33%" valign="top" style="padding-left:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);
                                  border:1px solid #bbf7d0; border-radius:16px; overflow:hidden;">
                      <tr>
                        <td style="padding:20px 16px; text-align:center;">
                          <div style="width:44px; height:44px; border-radius:12px;
                                      background:linear-gradient(135deg,#22c55e,#16a34a);
                                      margin:0 auto 12px; line-height:44px; text-align:center;
                                      font-size:20px;">
                            💼
                          </div>
                          <p style="font-size:13px; font-weight:700; color:#14532d; margin:0 0 6px;">
                            Career Support
                          </p>
                          <p style="font-size:12px; color:#4b5563; line-height:1.5; margin:0;">
                            CV reviews, interview prep & job strategy
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ─────────────────────────────────────────── -->
              <!--  NEXT STEPS SECTION                        -->
              <!-- ─────────────────────────────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);
                            border:1px solid #e2e8f0; border-radius:16px;
                            margin-bottom:32px; overflow:hidden;">
                <tr>
                  <td style="padding: 28px 28px 20px;">
                    <p style="font-size:14px; font-weight:700; color:#1e3a8a;
                               text-transform:uppercase; letter-spacing:0.08em; margin:0 0 20px;">
                      🚀 &nbsp;Get started in 3 steps
                    </p>

                    <!-- Step 1 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="margin-bottom:16px;">
                      <tr>
                        <td width="36" valign="top" style="padding-top:2px;">
                          <div style="width:28px; height:28px; border-radius:8px;
                                      background:linear-gradient(135deg,#3b82f6,#2563eb);
                                      text-align:center; line-height:28px;
                                      font-size:13px; font-weight:700; color:#ffffff;">
                            1
                          </div>
                        </td>
                        <td valign="top" style="padding-left:12px;">
                          <p style="font-size:14px; font-weight:700; color:#111827; margin:0 0 3px;">
                            Browse our courses
                          </p>
                          <p style="font-size:13px; color:#6b7280; margin:0; line-height:1.5;">
                            Explore the full catalogue and find the track that fits your goals.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 2 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                           style="margin-bottom:16px;">
                      <tr>
                        <td width="36" valign="top" style="padding-top:2px;">
                          <div style="width:28px; height:28px; border-radius:8px;
                                      background:linear-gradient(135deg,#8b5cf6,#7c3aed);
                                      text-align:center; line-height:28px;
                                      font-size:13px; font-weight:700; color:#ffffff;">
                            2
                          </div>
                        </td>
                        <td valign="top" style="padding-left:12px;">
                          <p style="font-size:14px; font-weight:700; color:#111827; margin:0 0 3px;">
                            Pick your payment plan
                          </p>
                          <p style="font-size:13px; color:#6b7280; margin:0; line-height:1.5;">
                            Pay in full or use our flexible installment plan — zero interest, zero stress.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Step 3 -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="36" valign="top" style="padding-top:2px;">
                          <div style="width:28px; height:28px; border-radius:8px;
                                      background:linear-gradient(135deg,#22c55e,#16a34a);
                                      text-align:center; line-height:28px;
                                      font-size:13px; font-weight:700; color:#ffffff;">
                            3
                          </div>
                        </td>
                        <td valign="top" style="padding-left:12px;">
                          <p style="font-size:14px; font-weight:700; color:#111827; margin:0 0 3px;">
                            Start learning immediately
                          </p>
                          <p style="font-size:13px; color:#6b7280; margin:0; line-height:1.5;">
                            Unlock your course, meet your mentor, and begin building.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- ─────────────────────────────────────────── -->
              <!--  PRIMARY CTA BUTTON                        -->
              <!-- ─────────────────────────────────────────── -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="margin-bottom: 40px;">
                <tr>
                  <td align="center">
                    <a href="{{ $coursesUrl }}"
                       style="display:inline-block; padding:16px 48px;
                              background:linear-gradient(135deg,#2563eb,#7c3aed);
                              color:#ffffff; font-size:16px; font-weight:700;
                              border-radius:9999px; text-decoration:none;
                              letter-spacing:0.01em;
                              box-shadow:0 8px 24px rgba(37,99,235,0.35);">
                      Explore Courses &rarr;
                    </a>
                    <br>
                    <a href="{{ $dashboardUrl }}"
                       style="display:inline-block; margin-top:12px;
                              color:#6b7280; font-size:13px; text-decoration:underline;">
                      Or go to your dashboard
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ╔═══════════════════════════════════════════════╗ -->
          <!-- ║  DIVIDER                                      ║ -->
          <!-- ╚═══════════════════════════════════════════════╝ -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height:1px; background:linear-gradient(90deg,transparent,#e5e7eb,transparent);"></div>
            </td>
          </tr>

          <!-- ╔═══════════════════════════════════════════════╗ -->
          <!-- ║  FOOTER                                       ║ -->
          <!-- ╚═══════════════════════════════════════════════╝ -->
          <tr>
            <td style="padding: 28px 40px 36px; text-align:center;">

              <!-- Brand -->
              <p style="font-size:15px; font-weight:800; color:#111827; margin:0 0 8px;
                         letter-spacing:-0.3px;">
                Learn<span style="color:#3b82f6;">exity</span>
              </p>

              <p style="font-size:12px; color:#9ca3af; line-height:1.6; margin:0 0 16px;">
                Real projects. Real mentors. Real careers.
              </p>

              <!-- Social / support links -->
              <p style="font-size:12px; color:#9ca3af; margin:0 0 8px;">
                Questions? Reply to this email or reach us at
                <a href="mailto:support@learnexity.com"
                   style="color:#3b82f6; text-decoration:none;">support@learnexity.com</a>
              </p>

              <p style="font-size:11px; color:#d1d5db; margin:0;">
                &copy; {{ date('Y') }} Learnexity. All rights reserved.<br>
                You received this email because you just verified your Learnexity account.
              </p>

            </td>
          </tr>

          <!-- Bottom gradient bar -->
          <tr>
            <td style="height:4px; background:linear-gradient(90deg,#3b82f6,#8b5cf6,#22c55e); line-height:4px; font-size:4px;">&nbsp;</td>
          </tr>

        </table>
        <!-- ─── END CARD ──────────────────────────────────────── -->

      </td>
    </tr>
  </table>

</body>
</html>