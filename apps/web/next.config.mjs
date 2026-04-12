/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@yiwugo/shared', '@yiwugo/ui'],
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.yiwugo.com' },
      { protocol: 'http', hostname: '**.yiwugo.com' },
      { protocol: 'http', hostname: 'img1.yiwugo.com' },
      { protocol: 'http', hostname: 'ywgimg.yiwugo.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'cbu01.alicdn.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://yiwugo-korea.vercel.app',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || '이우고 코리아',
  },
  // Only add API rewrite when a real API URL is configured
  ...(process.env.NEXT_PUBLIC_API_URL
    ? {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
