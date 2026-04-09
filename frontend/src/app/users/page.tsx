'use client';

import Header from '@/components/Header';
import { useGetUsersQuery } from '@/state/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import React from 'react';

const columns: GridColDef[] = [
  { field: 'userId', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 200 },
];

const User = () => {
  const { data: users, isError, isLoading } = useGetUsersQuery();

  if (isLoading) {
    return (
      <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent'></div>
    );
  }

  if (isError || !users) {
    return (
      <div className='text-center text-red-500 py-4'>Failed to fetch users</div>
    );
  }
  return (
    <div className='flex flex-col'>
      <Header name='Users' />
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.userId}
        checkboxSelection
        className='bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-800 mt-5 text-gray-700 dark:text-gray-100!'
      />
    </div>
  );
};

export default User;
