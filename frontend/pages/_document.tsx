import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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