'use client';

import Header from '@/components/Header';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '@/state/api';
import type { Product } from '@/state/api';
import { PlusCircleIcon, SearchIcon, SquarePen, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import CreateProductModal, { ProductFormData } from './CreateProductModal';
import EditProductModal from './EditProductModal';
import Image from 'next/image';

const formatVnd = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) return '0 VNĐ';
  return `${new Intl.NumberFormat('vi-VN').format(value)} VNĐ`;
};

const Product = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useGetProductsQuery(searchTerm);

  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      await createProduct(productData).unwrap();
      await refetch();
      toast.success('Đã tạo sản phẩm');
    } catch (error: unknown) {
      const apiError =
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof (error as { data?: { message?: string } }).data?.message ===
          'string'
          ? (error as { data?: { message?: string } }).data?.message
          : 'Tạo sản phẩm thất bại';
      toast.error(apiError);
    }
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditProduct = async (productData: ProductFormData) => {
    if (!selectedProduct) return false;
    try {
      await updateProduct({
        ...productData,
        productId: selectedProduct.productId,
      }).unwrap();
      await refetch();
      toast.success('Đã cập nhật sản phẩm');
      return true;
    } catch {
      toast.error('Cập nhật sản phẩm thất bại');
      return false;
    }
  };

  const handleDeleteProduct = (product: Product) => {
    toast(`Bạn có chắc muốn xóa "${product.name}"?`, {
      action: {
        label: 'Xóa',
        onClick: async () => {
          try {
            await deleteProduct(product.productId).unwrap();
            await refetch();
            toast.success('Đã xóa sản phẩm');
          } catch {
            toast.error('Xóa sản phẩm thất bại');
          }
        },
      },
      cancel: {
        label: 'Hủy',
        onClick: () => {},
      },
    });
  };

  if (isLoading) {
    return (
      <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent mx-auto'></div>
    );
  }

  if (isError || !products) {
    return (
      <div className='py-4 text-center text-red-500'>
        Có lỗi xảy ra khi truy cập dữ liệu.
      </div>
    );
  }
  return (
    <div className='w-full pb-5 mx-auto'>
      {/* SEARCH */}
      <div className='mb-6'>
        <div className='flex items-center border-2 border-gray-200 rounded'>
          <SearchIcon className='w-5 h-5 text-gray-500 m-2' />
          <input
            type='text'
            placeholder='Tìm kiếm sản phẩm'
            className='w-full px-5 py-3 bg-transparent border rounded-lg outline-none focus:border-blue-500 border-slate-200'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className='flex justify-between items-center mb-6'>
        <Header name='Sản phẩm' />
        <button
          className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
          onClick={() => setIsModalOpen(true)}>
          <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200!' />
          Tạo sản phẩm
        </button>
      </div>

      {/* BODY PRODUCT LIST */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {isLoading ? (
          <div className='col-span-full flex justify-center py-10'>
            <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent'></div>
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={product?.productId}
              className='group relative bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl p-4 flex flex-col'>
              {/* Action Buttons - Chỉ hiện rõ hơn khi hover card */}
              <div className='absolute top-3 right-3 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                <button
                  onClick={() => handleOpenEditModal(product)}
                  className='p-1.5 bg-white/80 backdrop-blur-sm shadow-sm rounded-full text-blue-600 hover:bg-blue-50 transition-colors'
                  title='Chỉnh sửa'>
                  <SquarePen className='w-5 h-5' />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  className='p-1.5 bg-white/80 backdrop-blur-sm shadow-sm rounded-full text-red-500 hover:bg-red-50 transition-colors'
                  title='Xóa'>
                  <Trash2 className='w-5 h-5' />
                </button>
              </div>

              {/* Product Image */}
              <div className='relative mb-4 overflow-hidden rounded-xl bg-gray-50 flex justify-center items-center h-48'>
                <Image
                  src={product?.imageUrl || `/img-default.jpg`}
                  alt={product?.name}
                  className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                  width={300}
                  height={300}
                  loading='eager'
                />
                {product?.rating && (
                  <div className='absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded-lg flex items-center gap-1 text-xs font-bold text-amber-500 shadow-sm'>
                    ⭐ {product.rating}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className='flex flex-col grow'>
                <h3 className='text-md font-bold text-gray-800 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors'>
                  {product?.name}
                </h3>

                <div className='flex items-baseline gap-1 mb-3'>
                  <span className='text-lg font-extrabold text-blue-600'>
                    {formatVnd(product?.unitPrice ?? product?.price)}
                  </span>
                  <span className='text-xs text-gray-400'>
                    /{product?.unitOfMeasure || 'cái'}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-2 pt-3 border-t border-gray-50 mt-auto'>
                  <div className='flex flex-col'>
                    <span className='text-[10px] uppercase font-semibold text-gray-400 tracking-wider'>
                      Tồn kho
                    </span>
                    <span
                      className={`text-sm font-medium ${product?.stockQuantity > 0 ? 'text-gray-700' : 'text-red-500'}`}>
                      {product?.stockQuantity.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex flex-col text-right'>
                    <span className='text-[10px] uppercase font-semibold text-gray-400 tracking-wider'>
                      Tổng giá trị
                    </span>
                    <span className='text-sm font-medium text-gray-700'>
                      {formatVnd(product?.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Dates Section - Tinh gọn hơn */}
                {/* <div className='mt-3 space-y-1'>
                  <div className='flex justify-between text-[11px] text-gray-500'>
                    <span>Ngày nhập:</span>
                    <span className='font-medium text-gray-600'>
                      {formatDate(product?.dateStocked)}
                    </span>
                  </div>
                  {product?.dateShipped && (
                    <div className='flex justify-between text-[11px] text-gray-500'>
                      <span>Ngày xuất:</span>
                      <span className='font-medium text-gray-600'>
                        {formatDate(product?.dateShipped)}
                      </span>
                    </div>
                  )}
                </div> */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL CREATE PRODUCT */}
      {isModalOpen && (
        <CreateProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProduct}
        />
      )}

      <EditProductModal
        key={selectedProduct?.productId}
        isOpen={isEditModalOpen}
        product={selectedProduct}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleEditProduct}
      />
    </div>
  );
};

export default Product;
