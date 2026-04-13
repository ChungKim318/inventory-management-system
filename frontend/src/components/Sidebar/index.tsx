'use client';

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsSidebarCollapsed } from '@/state';
import {
  Archive,
  Clipboard,
  Layout,
  LucideIcon,
  Menu,
  SlidersHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

interface SidebarLinksProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
}

const SidebarLinks = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinksProps) => {
  const pathName = usePathname();
  const isActive =
    pathName === href || (pathName === '/' && href === '/dashboard');
  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center ${isCollapsed ? 'justify-center py-4' : 'justify-start px-8 py-4'} hover:text-blue-500 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-800 gap-3 transition-colors ${isActive ? 'bg-blue-200 dark:bg-blue-900 text-white' : ''}`}>
        <Icon className='w-6 h-6 text-gray-700! dark:text-gray-200' />
        <span
          className={`${isCollapsed ? 'hidden' : 'block'} font-medium text-gray-700 dark:text-gray-200`}>
          {label}
        </span>
      </div>
    </Link>
  );
};
const SideBar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassName = `fixed flex flex-col ${
    isSidebarCollapsed ? 'w-0 md:w-16' : 'w-72 md:w-64'
  } bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden h-full shadow-md dark:shadow-gray-950 z-40 border-r border-gray-100 dark:border-gray-800`;

  return (
    <div className={sidebarClassName}>
      {/* Top Logo */}
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${isSidebarCollapsed ? 'px-5' : 'px-8'}`}>
        {/* <div>Logo</div> */}
        <h1
          className={`${isSidebarCollapsed ? 'hidden' : 'block'} font-extrabold text-2xl text-red-500 mx-auto`}>
          ANHUCO
        </h1>
        <button
          className='md:hidden px-3 py-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-gray-700'
          onClick={toggleSidebar}>
          <Menu className='w-4 h-4 text-gray-700 dark:text-gray-100' />
        </button>
      </div>

      {/* Links */}
      <div className='grow mt-8'>
        <SidebarLinks
          href='/dashboard'
          icon={Layout}
          label='Tổng quan'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLinks
          href='/products'
          icon={Clipboard}
          label='Sản phẩm'
          isCollapsed={isSidebarCollapsed}
        />
        <SidebarLinks
          href='/inventory'
          icon={Archive}
          label='Kho hàng'
          isCollapsed={isSidebarCollapsed}
        />
        {/* <SidebarLinks
          href='/users'
          icon={User}
          label='Users'
          isCollapsed={isSidebarCollapsed}
        /> */}
        <SidebarLinks
          href='/settings'
          icon={SlidersHorizontal}
          label='Cài đặt'
          isCollapsed={isSidebarCollapsed}
        />
        {/* <SidebarLinks
          href='/expenses'
          icon={CircleDollarSign}
          label='Expenses'
          isCollapsed={isSidebarCollapsed}
        /> */}
      </div>

      {/* Footer */}
      <div className={`${isSidebarCollapsed ? 'hidden' : 'block'} mb-10`}>
        <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
          &Copy; 2026 - KIM CHUNG - BAN CNTT
        </p>
      </div>
    </div>
  );
};

export default SideBar;
