import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // 隱藏 Next.js 指紋
  images: {
  unoptimized: false,
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.public.blob.vercel-storage.com', // 允许所有 Vercel Blob 域名
      pathname: '/**',
    },
  ],
},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-XSS-Protection", value: "0" },
          {
            key: "Content-Security-Policy",
            // 在你的 next.config.ts 的 CSP 字符串中参考以下配置
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://static.airwallex.com https://static-demo.airwallex.com https://js.airwallex.com https://checkout.airwallex.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: https://www.google-analytics.com https://api.airwallex.com https://api-demo.airwallex.com https://js.airwallex.com https://checkout.airwallex.com; frame-src 'self' https://checkout.airwallex.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;