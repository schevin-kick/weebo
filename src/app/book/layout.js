import Script from 'next/script';

export default function BookLayout({ children }) {
  return (
    <>
      {/* Load LIFF SDK */}
      <Script
        src="https://static.line-scdn.net/liff/edge/2/sdk.js"
        strategy="beforeInteractive"
      />
      {children}
    </>
  );
}
