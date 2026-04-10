'use client';

import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import BottomNav from '@/components/common/BottomNav';
import Toast from '@/components/common/Toast';

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-14 md:pt-16 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <Toast />
    </>
  );
}
