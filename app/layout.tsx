import type { Metadata } from "next";
import { Noto_Sans_HK } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/ui/LayoutShell";
import AuthProvider from "@/components/providers/AuthProvider";
import Script from "next/script"; // 👈 新增這個
import { JsonLd } from "@/components/JsonLd"; // 👈 新增這個

const notoSansHK = Noto_Sans_HK({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ochiu.co"),
  title: {
    default: "O'CHIU | 無定向，其實冇諗咁多",
    template: "%s | O'CHIU",
  },
  description: "O'CHIU 相信衣服不需要張揚，卻可以給人力量。我們做的每一件，都希望成為你最自在的那一件。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className={notoSansHK.variable}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        {/* 👇 這裡加入 GA4 與 JSON-LD */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
               <body className="font-sans antialiased">
        {/* 👇 這裡加入 GA4 與 JSON-LD */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-T5WS07Y2ZR" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T5WS07Y2ZR');
          `}
        </Script>

          "@type": "Organization",
          name: "O'CHIU",
          url: "https://ochiu.co",
          logo: "https://ochiu.co/icon.png",
          sameAs: ["https://instagram.com/ochiu.co"],
        }} />
        {/* 👆 到這裡結束 */}

        <AuthProvider>
          <LayoutShell>
            <main className="min-h-screen">
              {children}
            </main>
          </LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}