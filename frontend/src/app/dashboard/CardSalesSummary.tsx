import React, { useMemo } from 'react';
import { useGetProductsQuery } from '@/state/api';
import { TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const truncateName = (name: string) =>
  name.length > 14 ? `${name.slice(0, 14)}...` : name;

const CardSalesSummary = () => {
  const { data: products, isLoading, isError } = useGetProductsQuery();

  const chartData = useMemo(() => {
    return (products ?? [])
      .map((product) => ({
        name: truncateName(product.name),
        fullName: product.name,
        exportedQuantity: product.shippedQuantity ?? 0,
      }))
      .sort((a, b) => b.exportedQuantity - a.exportedQuantity)
      .slice(0, 8);
  }, [products]);

  const totalExportedQuantity = chartData.reduce(
    (sum, item) => sum + item.exportedQuantity,
    0,
  );
  const averageExportedQuantity =
    chartData.length > 0 ? totalExportedQuantity / chartData.length : 0;

  if (isError) {
    return <div className='m-5'>Failed to fetch data</div>;
  }

  return (
    <div className='flex flex-col justify-between bg-white dark:bg-gray-900 shadow-md rounded-2xl border border-gray-100 dark:border-gray-800'>
      {isLoading ? (
        <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent mx-auto'></div>
      ) : (
        <>
          <div>
            <h2 className='pt-5 mb-2 text-lg font-semibold px-7 dark:text-gray-100'>
              Tình trạng xuất kho
            </h2>
            <hr />
          </div>

          <div>
            <div className='flex items-end justify-between mt-5 mb-6 px-7'>
              <div>
                <p className='text-xs text-gray-400 dark:text-gray-500'>
                  Tổng số lượng đã xuất (Top 8 sản phẩm)
                </p>
                <span className='text-2xl font-extrabold dark:text-gray-100'>
                  {totalExportedQuantity.toLocaleString('vi-VN')}
                </span>
                <span className='ml-2 text-sm text-green-500'>
                  <TrendingUp className='inline w-4 h-4 mr-1' />
                  TB {averageExportedQuantity.toFixed(1)}
                </span>
              </div>
            </div>

            <ResponsiveContainer width='100%' height={350} className='px-7'>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 12 }}>
                <CartesianGrid strokeDasharray='3 3' vertical={false} />
                <XAxis dataKey='name' tick={{ fontSize: 12 }} interval={0} />
                <YAxis
                  tickFormatter={(value) => Number(value).toLocaleString('vi-VN')}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value || 0).toLocaleString('vi-VN')} sản phẩm`,
                    'Đã xuất',
                  ]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName ?? 'Sản phẩm'
                  }
                />
                <Bar
                  dataKey='exportedQuantity'
                  fill='#2563eb'
                  barSize={18}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <hr />
            <div className='flex items-center justify-between mt-6 mb-4 text-sm px-7 text-gray-600 dark:text-gray-300'>
              <p>{chartData.length} sản phẩm trong biểu đồ</p>
              <p>
                Sản phẩm xuất nhiều nhất:{' '}
                <span className='font-semibold'>
                  {chartData[0]?.fullName ?? 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
