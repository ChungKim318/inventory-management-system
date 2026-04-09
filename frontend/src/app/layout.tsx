import type { Metadata } from 'next';
import './globals.css';
import { manrope } from '@/utils/fonts';
import DashboardWrapper from '@/app/dashboardWrapper';
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'Quản Lý Kho Hàng',
  description: 'Ứng dụng quản lý kho hàng',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={manrope.variable}>
      <body className='flex flex-col min-h-full'>
        <ClerkProvider>
          <DashboardWrapper>{children}</DashboardWrapper>
          <Toaster richColors position='top-right' />
        </ClerkProvider>
      </body>
    </html>
  );
}
