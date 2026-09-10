<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 0; }
        html, body { margin: 0; padding: 0; }

        @foreach ($fontFaces as $font)
        @font-face {
            font-family: '{{ $font['family'] }}';
            src: url('{{ $font['dataUri'] }}') format('truetype');
            font-weight: {{ $font['weight'] }};
            font-style: {{ $font['style'] }};
        }
        @endforeach

        .canvas {
            position: relative;
            width: {{ $widthPx }}px;
            height: {{ $heightPx }}px;
            overflow: hidden;
        }
        .canvas .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: {{ $widthPx }}px;
            height: {{ $heightPx }}px;
        }
        .field {
            position: absolute;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <div class="canvas">
        <img class="bg" src="{{ $imageDataUri }}">

        @foreach ($fields as $field)
            <div class="field" style="
                left: {{ $field['x_pct'] }}%;
                top: {{ $field['y_pct'] }}%;
                width: {{ $field['max_width_pct'] }}%;
                text-align: {{ $field['align'] }};
                color: {{ $field['color'] }};
                font-family: '{{ $field['font_family'] }}';
                font-size: {{ $field['font_size_px'] }}px;
                line-height: {{ $field['line_height'] }};
            ">{{ $field['text'] }}</div>
        @endforeach

        @if ($signature)
            <img style="
                position: absolute;
                left: {{ $signature['x_pct'] }}%;
                top: {{ $signature['y_pct'] }}%;
                width: {{ $signature['width_pct'] }}%;
            " src="{{ $signature['dataUri'] }}">
        @endif
    </div>
</body>
</html>
