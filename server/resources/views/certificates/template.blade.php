<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; }
        body {
            margin: 0;
            font-family: 'Helvetica', 'Arial', sans-serif;
            background: #ffffff;
        }
        .cert-wrap {
            width: 100%;
            height: 100%;
            padding: 36px;
            box-sizing: border-box;
        }
        .cert-border {
            border: 3px solid #4A3AFF;
            padding: 50px 60px;
            text-align: center;
            position: relative;
        }
        .cert-eyebrow {
            letter-spacing: 4px;
            text-transform: uppercase;
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 18px;
        }
        .cert-title {
            font-size: 34px;
            font-weight: bold;
            color: #111827;
            margin: 0 0 8px 0;
        }
        .cert-sub {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 36px;
        }
        .cert-name {
            font-size: 30px;
            font-weight: bold;
            color: #4A3AFF;
            margin: 10px 0 26px 0;
            border-bottom: 1px solid #e5e7eb;
            display: inline-block;
            padding-bottom: 10px;
        }
        .cert-body {
            font-size: 14px;
            color: #374151;
            line-height: 1.8;
            max-width: 560px;
            margin: 0 auto 30px auto;
        }
        .cert-course {
            font-size: 20px;
            font-weight: bold;
            color: #111827;
        }
        .cert-footer {
            margin-top: 50px;
            display: table;
            width: 100%;
        }
        .cert-footer-col {
            display: table-cell;
            width: 50%;
            text-align: center;
            font-size: 11px;
            color: #6b7280;
        }
        .cert-footer-col strong {
            display: block;
            font-size: 13px;
            color: #111827;
            margin-bottom: 4px;
        }
        .cert-uid {
            margin-top: 30px;
            font-size: 9px;
            color: #9ca3af;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="cert-wrap">
        <div class="cert-border">
            <div class="cert-eyebrow">Learnexity &mdash; Certificate of Completion</div>
            <div class="cert-title">Certificate of Completion</div>
            <div class="cert-sub">This certificate is proudly presented to</div>

            <div class="cert-name">{{ $recipientName }}</div>

            <div class="cert-body">
                for successfully completing the course
                <div class="cert-course">{{ $courseTitle }}</div>
                on {{ $issuedAt }}, demonstrating dedication and commitment to learning.
            </div>

            <div class="cert-footer">
                <div class="cert-footer-col">
                    <strong>{{ $issuedAt }}</strong>
                    Date Issued
                </div>
                <div class="cert-footer-col">
                    <strong>Learnexity</strong>
                    Issuing Organization
                </div>
            </div>

            <div class="cert-uid">CERTIFICATE ID: {{ strtoupper($certificateUid) }}</div>
        </div>
    </div>
</body>
</html>
