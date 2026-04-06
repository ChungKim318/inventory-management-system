import { useGetProductsQuery } from '@/state/api';
import React, { useMemo, useState } from 'react';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type InventoryItem = {
  name: string;
  amount: number;
  color: string;
};

const InventoryColors = {
  imported: '#10b981',
  shipped: '#f59e0b',
  stock: '#3b82f6',
};

const normalizeDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const formatQuantity = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value || 0);

const CardInventorySummary = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedType, setSelectedType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: productsData, isLoading, isError } = useGetProductsQuery();

  const inventoryData: InventoryItem[] = useMemo(() => {
    const products = productsData ?? [];

    const totals = products.reduce(
      (acc, product) => {
        const currentStock = product.stockQuantity ?? 0;
        const currentShipped = product.shippedQuantity ?? 0;
        const currentImported = currentStock + currentShipped;

        const stockedDate = normalizeDate(product.dateStocked);
        const shippedDate = normalizeDate(product.dateShipped);

        const inStockedRange =
          !startDate ||
          !endDate ||
          (stockedDate >= startDate && stockedDate <= endDate);
        const inShippedRange =
          !startDate ||
          !endDate ||
          (shippedDate >= startDate && shippedDate <= endDate);

        if (inStockedRange) {
          acc.imported += currentImported;
          acc.stock += currentStock;
        }

        if (inShippedRange) {
          acc.shipped += currentShipped;
        }

        return acc;
      },
      { imported: 0, shipped: 0, stock: 0 },
    );

    const data: InventoryItem[] = [
      {
        name: 'Nhập kho',
        amount: totals.imported,
        color: InventoryColors.imported,
      },
      {
        name: 'Xuất kho',
        amount: totals.shipped,
        color: InventoryColors.shipped,
      },
      {
        name: 'Tồn kho',
        amount: totals.stock,
        color: InventoryColors.stock,
      },
    ];

    if (selectedType === 'All') return data;

    return data.filter((item) => item.name === selectedType);
  }, [productsData, selectedType, startDate, endDate]);

  // const totalAmount = inventoryData.reduce((acc, item) => acc + item.amount, 0);

  const classNames = {
    label: 'block text-sm font-medium text-gray-700',
    selectInput:
      'mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md',
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center bg-white shadow rounded-lg p-4'>
        <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent'></div>
      </div>
    );
  }

  if (isError || !productsData) {
    return (
      <div className='text-center text-red-500 py-4 bg-white shadow rounded-lg'>
        Không thể truy xuất dữ liệu
      </div>
    );
  }

  return (
    <div className='row-span-3 bg-white shadow rounded-lg p-4 md:p-6 h-fit'>
      <div className='mb-4'>
        <h3 className='text-lg font-semibold'>Tổng hàng hoá xuất nhập</h3>
        <p className='text-sm text-gray-500'>
          Theo dõi số lượng nhập kho, xuất kho và tồn kho sản phẩm.
        </p>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          <div>
            <label htmlFor='inventory-type' className={classNames.label}>
              Loại dữ liệu
            </label>
            <select
              id='inventory-type'
              name='inventory-type'
              className={classNames.selectInput}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}>
              <option value='All'>Tất cả</option>
              <option value='Nhập kho'>Nhập kho</option>
              <option value='Xuất kho'>Xuất kho</option>
              <option value='Tồn kho'>Tồn kho</option>
            </select>
          </div>

          <div>
            <label htmlFor='inventory-start-date' className={classNames.label}>
              Ngày bắt đầu
            </label>
            <input
              type='date'
              id='inventory-start-date'
              name='inventory-start-date'
              className={classNames.selectInput}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor='inventory-end-date' className={classNames.label}>
              Ngày kết thúc
            </label>
            <input
              type='date'
              id='inventory-end-date'
              name='inventory-end-date'
              className={classNames.selectInput}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className='bg-gray-50 rounded-lg p-2 md:p-4'>
          <ResponsiveContainer width='100%' height={280}>
            <PieChart>
              <Pie
                data={inventoryData.map((item, index) => ({
                  ...item,
                  fill: index === activeIndex ? '#1d4ed8' : item.color,
                }))}
                cx='50%'
                cy='50%'
                label
                outerRadius={100}
                dataKey='amount'
                onMouseEnter={(_, index) => setActiveIndex(index)}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatQuantity(Number(value ?? 0)),
                  name,
                ]}
              />
              <Legend
                formatter={(value) => {
                  const item = inventoryData.find(
                    (entry) => entry.name === value,
                  );
                  if (!item) return value;
                  return `${value}: ${formatQuantity(item.amount)}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* <div className='text-center text-sm text-gray-600 mt-2'>
            Tổng:{' '}
            <span className='font-semibold'>{formatQuantity(totalAmount)}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default CardInventorySummary;
