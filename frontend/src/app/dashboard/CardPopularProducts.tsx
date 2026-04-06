import { useGetDashboardMetricsQuery } from '@/state/api';
import { ShoppingBag } from 'lucide-react';
import React from 'react';

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();
  const formatVnd = (value: number) =>
    `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`;
  return (
    <div className='row-span-3 pb-16 bg-white shadow-md xl:row-span-6 rounded-2xl'>
      {isLoading ? (
        <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent mx-auto'></div>
      ) : (
        <>
          <h3 className='pt-5 pb-2 text-lg font-semibold px-7'>
            Sản phẩm tiêu biểu
          </h3>
          <hr />
          <div className='h-full overflow-auto'>
            {dashboardMetrics?.popularProducts.map((product) => (
              <div
                key={product.productId}
                className='flex items-center justify-between gap-3 px-5 border-b py-7'>
                <div className='flex items-center gap-3'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl || 'https://picsum.photos/200'}
                    alt={product?.name}
                    className='rounded-lg w-14 h-14 object-cover'
                  />
                  <div className='flex flex-col justify-between gap-1'>
                    <div className='font-bold text-gray-700'>
                      {product?.name}
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='text-xs font-bold text-blue-500'>
                        {formatVnd(product?.unitPrice ?? product?.price)}
                      </span>
                      <span className='mx-2'>|</span>
                      <span className='text-xs text-gray-600'>
                        {product?.rating || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='flex items-center text-xs'>
                  <button className='p-2 mr-2 text-blue-600 bg-blue-100 rounded-full'>
                    <ShoppingBag className='w-4 h-4' />
                  </button>
                  {Math.round(product.stockQuantity / 1000)}k lượt mua
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
