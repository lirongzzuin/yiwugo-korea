import type { Metadata } from 'next';
import { Manrope, Be_Vietnam_Pro } from 'next/font/google';
import '@/styles/globals.css';
import ScrollToTop from '@/components/common/ScrollToTop';

const manrope = Manrope({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: '이우고 코리아 | YiwuGo Korea - 중국 도매 마켓플레이스',
  description:
    '중국 이우 시장 200만개 상품을 한국에서 쉽고 안전하게 도매 구매하세요. 실시간 환율, 한국어 지원, 검수 서비스까지 원스톱 직구 플랫폼.',
  keywords: [
    '이우',
    '도매',
    '중국 도매',
    '직구',
    '이우 시장',
    'yiwu',
    '중국 수입',
    '소싱',
  ],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://yiwugo.kr',
    siteName: 'YiwuGo Korea',
    title: '이우고 코리아 | YiwuGo Korea - 중국 도매 마켓플레이스',
    description:
      '중국 이우 시장 200만개 상품을 한국에서 쉽고 안전하게 도매 구매하세요.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YiwuGo Korea',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '이우고 코리아 | YiwuGo Korea',
    description: '중국 이우 시장 200만개 상품 도매 구매 플랫폼',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${manrope.variable} ${beVietnamPro.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <meta name="theme-color" content="#b32008" />
      </head>
      <body className="antialiased min-h-screen bg-surface text-on-surface font-body">
        {children}
        <ScrollToTop />
      </body>
    </html>
  );
}
