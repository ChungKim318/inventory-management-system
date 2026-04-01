'use client';

import Header from '@/components/Header';
import { useGetProductsQuery } from '@/state/api';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';

const columns: GridColDef[] = [
  { field: 'productId', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 200 },
  {
    field: 'price',
    headerName: 'Price',
    width: 110,
    valueGetter: (value, row) => `${row.price.toFixed(3)} VNĐ`,
  },
  {
    field: 'rating',
    headerName: 'Rating',
    width: 110,
    valueGetter: (value, row) => (row.rating ? row.rating.toFixed(1) : 'N/A'),
  },
  {
    field: 'stockQuantity',
    headerName: 'Stock Quantity',
    width: 150,
    valueGetter: (value, row) =>
      row.stockQuantity ? row.stockQuantity.toLocaleString() : 'N/A',
  },
];

const Inventory = () => {
  const { data: products, isError, isLoading } = useGetProductsQuery();

  if (isLoading) {
    return (
      <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent'></div>
    );
  }

  if (isError || !products) {
    return (
      <div className='py-5 text-center text-red-500'>
        Failed to loading Products
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <Header name='Inventory' />
      <DataGrid
        rows={products}
        columns={columns}
        getRowId={(row) => row.productId}
        checkboxSelection
        className='bg-white shadow rounded-lg border border-gray-200 mt-5 text-gray-700!'
      />
    </div>
  );
};

export default Inventory;
