import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Paystack Inline Script */}
        <script src="https://js.paystack.co/v1/inline.js"></script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}