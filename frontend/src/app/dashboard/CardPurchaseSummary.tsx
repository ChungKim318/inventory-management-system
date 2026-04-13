import { useGetProductsQuery } from '@/state/api';
import { TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const truncateName = (name: string) =>
  name.length > 14 ? `${name.slice(0, 14)}...` : name;

const CardPurchaseSummary = () => {
  const { data: products, isLoading, isError } = useGetProductsQuery();

  const purchaseData = useMemo(() => {
    return (products ?? [])
      .map((product) => {
        const stockQuantity = product.stockQuantity ?? 0;
        const shippedQuantity = product.shippedQuantity ?? 0;
        return {
          name: truncateName(product.name),
          fullName: product.name,
          importedQuantity: stockQuantity + shippedQuantity,
        };
      })
      .sort((a, b) => b.importedQuantity - a.importedQuantity)
      .slice(0, 8);
  }, [products]);

  const totalImportedQuantity = purchaseData.reduce(
    (sum, item) => sum + item.importedQuantity,
    0,
  );
  const averageImportedQuantity =
    purchaseData.length > 0 ? totalImportedQuantity / purchaseData.length : 0;

  if (isError) {
    return <div className='m-5'>Failed to fetch data</div>;
  }

  return (
    <div className='flex flex-col justify-between col-span-1 row-span-2 bg-white dark:bg-gray-900 shadow-md xl:row-span-3 md:col-span-2 xl:col-span-1 rounded-2xl border border-gray-100 dark:border-gray-800 h-fit'>
      {isLoading ? (
        <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent mx-auto'></div>
      ) : (
        <>
          <div>
            <h2 className='pt-5 mb-2 text-lg font-semibold px-7 dark:text-gray-100'>
              Tình trạng nhập kho
            </h2>
            <hr />
          </div>

          <div>
            <div className='mb-4 mt-7 px-7'>
              <p className='text-xs text-gray-400 dark:text-gray-500'>
                Tổng số lượng đã nhập (Top 8 sản phẩm)
              </p>
              <div className='flex items-center'>
                <p className='text-2xl font-bold dark:text-gray-100'>
                  {totalImportedQuantity.toLocaleString('vi-VN')}
                </p>
                <p className='text-sm text-green-500 flex ml-3'>
                  <TrendingUp className='w-5 h-5 mr-1' />
                  TB {averageImportedQuantity.toFixed(1)}
                </p>
              </div>
            </div>

            <ResponsiveContainer width='100%' height={220} className='p-2'>
              <AreaChart
                data={purchaseData}
                margin={{ top: 0, right: 10, left: -10, bottom: 30 }}>
                <XAxis
                  dataKey='name'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => Number(value).toLocaleString('vi-VN')}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value || 0).toLocaleString('vi-VN')} sản phẩm`,
                    'Đã nhập',
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? 'Sản phẩm'
                  }
                />
                <Area
                  type='monotone'
                  dataKey='importedQuantity'
                  stroke='#0f766e'
                  fill='#14b8a6'
                  fillOpacity={0.25}
                  dot={{ r: 3 }}
                  isAnimationActive
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default CardPurchaseSummary;
