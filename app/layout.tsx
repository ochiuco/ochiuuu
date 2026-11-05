import type { Metadata } from "next";
import { Noto_Sans_HK } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/ui/LayoutShell";
import AuthProvider from "@/components/providers/AuthProvider";
import { JsonLd } from "@/components/JsonLd";
import { GoogleTagManager } from '@next/third-parties/google'; // 👈 引入 GTM

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
        
        {/* 👇 這是 GTM 標籤，保留這個即可，原本手動寫的 GA4 <Script> 已經幫你拿掉了 */}
        <GoogleTagManager gtmId="GTM-T5HZVH3W" />

        {/* JSON-LD 結構化資料 */}
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "O'CHIU",
          url: "https://ochiu.co",
          logo: "https://ochiu.co/icon.png",
          sameAs: ["https://instagram.com/ochiu.co"],
        }} />

        {/* 原有的 Provider 與 Layout */}
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
