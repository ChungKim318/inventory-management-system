'use client';

import StoreProvider, { useAppSelector } from '@/app/redux';
import Navbar from '@/components/Navbar';
import SideBar from '@/components/Sidebar';
import React, { useEffect } from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  return (
    <div className={`flex bg-gray-50 text-gray-900 w-full min-h-screen`}>
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
