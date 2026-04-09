'use client';

import StoreProvider, { useAppSelector } from '@/app/redux';
import Navbar from '@/components/Navbar';
import SideBar from '@/components/Sidebar';
import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const isAuthPage =
    pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div
      className={`flex bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 w-full min-h-screen`}>
      <SideBar />
      <main
        className={`flex flex-col w-full h-full py-7 px-9 ${isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'}`}>
        <Navbar />
        {children}
      </main>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <StoreProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </StoreProvider>
  );
};

export default DashboardWrapper;
