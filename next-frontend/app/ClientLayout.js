'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { Toaster } from 'react-hot-toast';
import ChatWidget from '../components/ai/ChatWidget';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/dashboard/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className={!isAdminRoute ? 'pt-16' : ''}>{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <ChatWidget />}
      <Toaster position="bottom-right" />
    </>
  );
}
