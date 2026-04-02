import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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