// pages/_document.tsx

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Set data-theme on <html> before hydration so there's no flash of
            the wrong theme. Mirrors the logic in contexts/ThemeContext.tsx —
            keep the two in sync if this ever changes.
            Default (nothing stored yet) is "dark", regardless of OS preference —
            only an explicit "light" or "system" choice overrides that. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var stored = localStorage.getItem('learnexity-theme');
                  var theme;
                  if (stored === 'light' || stored === 'dark') {
                    theme = stored;
                  } else if (stored === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  } else {
                    theme = 'dark';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                  document.documentElement.style.colorScheme = theme;
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-4F1X8FYK2W"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4F1X8FYK2W');
            `,
          }}
        />

        {/* Canonical domain hint */}
        <link rel="canonical" href="https://learnexity.org" />

        {/* Paystack Script (defer prevents blocking rendering) */}
        <script
          src="https://js.paystack.co/v1/inline.js"
          defer
        ></script>
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}