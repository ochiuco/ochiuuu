import type { Metadata } from 'next';
import { Noto_Sans_HK } from 'next/font/google';
import './globals.css';
import LayoutShell from '@/components/ui/LayoutShell';
import AuthProvider from '@/components/providers/AuthProvider';

const notoSansHK = Noto_Sans_HK({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-noto',
});

export const metadata: Metadata = {
  title: "O'CHIU | 無定向，其實冇諗咁多",
  description: "Just a mood in the shop.",
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