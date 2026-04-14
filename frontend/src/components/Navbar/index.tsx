'use client';

import { useAppDispatch, useAppSelector } from '@/app/redux';
import { setIsDarkMode, setIsSidebarCollapsed } from '@/state';
import { Building2, Menu, Moon, Settings, Sun, Warehouse } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

const Navbar = () => {
  const { isSignedIn } = useAuth();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed,
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };
  return (
    <div className='mb-7 rounded-2xl border border-slate-200/70 bg-linear-to-r from-cyan-50 via-sky-50 to-indigo-50 px-4 py-3 shadow-lg shadow-sky-100/50 backdrop-blur dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:shadow-slate-950/40'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex items-start gap-4 md:items-center'>
          <button
            className='rounded-xl border border-slate-200/70 bg-white/90 p-3 transition-colors hover:bg-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'
            onClick={toggleSidebar}>
            <Menu className='h-4 w-4 text-slate-700 dark:text-slate-100' />
          </button>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='hidden rounded-xl bg-linear-to-br from-sky-500 to-indigo-600 p-2.5 text-white shadow-md sm:block'>
              <Warehouse className='h-5 w-5' />
            </div>
            <div className='min-w-0'>
              <h1 className='truncate text-lg font-extrabold tracking-tight sm:text-xl dark:text-slate-100 bg-linear-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent'>
                Phần mềm quản lý kho hàng
              </h1>
              <p className='mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-600 dark:text-slate-400'>
                <Building2 className='h-3.5 w-3.5' />
                Công ty Cổ phần AN HƯNG
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-end gap-3'>
          <button
            onClick={toggleDarkMode}
            className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/90 transition-colors hover:bg-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700'>
            {isDarkMode ? (
              <Sun className='text-amber-400' size={20} />
            ) : (
              <Moon className='text-slate-600 dark:text-slate-300' size={20} />
            )}
          </button>

          <Link
            href='/settings'
            className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/70 bg-white/90 text-slate-600 transition-colors hover:bg-sky-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'>
            <Settings size={20} />
          </Link>

          {isSignedIn ? (
            <div className='rounded-xl border border-slate-200/70 bg-white/90 p-1 dark:border-slate-700 dark:bg-slate-800'>
              <UserButton />
            </div>
          ) : (
            <SignInButton mode='modal'>
              <button className='rounded-xl bg-linear-to-r from-sky-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90'>
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
