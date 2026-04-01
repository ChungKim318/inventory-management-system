import Rating from '@/components/Rating';
import { useGetDashboardMetricsQuery } from '@/state/api';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

const CardPopularProducts = () => {
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();
  return (
    <div className='row-span-3 pb-16 bg-white shadow-md xl:row-span-6 rounded-2xl'>
      {isLoading ? (
        <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent'></div>
      ) : (
        <>
          <h3 className='pt-5 pb-2 text-lg font-semibold px-7'>
            Popular Product
          </h3>
          <hr />
          <div className='h-full overflow-auto'>
            {dashboardMetrics?.popularProducts.map((product) => (
              <div
                key={product.productId}
                className='flex items-center justify-between gap-3 px-5 border-b py-7'>
                <div className='flex items-center gap-3'>
                  <Image
                    src={`https://picsum.photos/200`}
                    alt={product?.name}
                    width={50}
                    height={50}
                    className='rounded-lg w-14 h-14'
                  />
                  <div className='flex flex-col justify-between gap-1'>
                    <div className='font-bold text-gray-700'>
                      {product?.name}
                    </div>
                    <div className='flex items-center text-sm'>
                      <span className='text-xs font-bold text-blue-500'>
                        {product?.price.toFixed(3)} VNĐ
                      </span>
                      <span className='mx-2'>|</span>
                      <Rating rating={product?.rating || 0} />
                    </div>
                  </div>
                </div>

                <div className='flex items-center text-xs'>
                  <button className='p-2 mr-2 text-blue-600 bg-blue-100 rounded-full'>
                    <ShoppingBag className='w-4 h-4' />
                  </button>
                  {Math.round(product.stockQuantity / 1000)}k Sold
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
