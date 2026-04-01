'use client';

import Header from '@/components/Header';
import Rating from '@/components/Rating';
import {
  useCreateProductMutation,
  useDeleteProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '@/state/api';
import type { Product } from '@/state/api';
import { PlusCircleIcon, SearchIcon, SquarePen, Trash2 } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import { toast } from 'sonner';
import CreateProductModal from './CreateProductModal';
import EditProductModal from './EditProductModal';

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
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
    await createProduct(productData);
  };

  const handleOpenEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditProduct = async (productData: ProductFormData) => {
    if (!selectedProduct) return;

    await updateProduct({
      productId: selectedProduct.productId,
      ...productData,
    }).unwrap();
    await refetch();
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
    return <div className='py-4'>Loading...</div>;
  }

  if (isError || !products) {
    return (
      <div className='py-4 text-center text-red-500'>
        Failed to fetch products
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
            placeholder='Enter your content'
            className='w-full px-5 py-3 bg-transparent border rounded-lg outline-none focus:border-blue-500 border-slate-200'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className='flex justify-between items-center mb-6'>
        <Header name='Products' />
        <button
          className='flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded'
          onClick={() => setIsModalOpen(true)}>
          <PlusCircleIcon className='w-5 h-5 mr-2 text-gray-200!' />
          Create Product
        </button>
      </div>

      {/* BODY PRODUCT LIST */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg-grid-cols-3 gap-10 justify-between'>
        {isLoading ? (
          <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent'></div>
        ) : (
          products.map((product, index) => (
            <div
              key={product?.productId}
              className='relative border shadow rounded-md p-4 max-w-full w-full mx-auto'>
              <div className='absolute top-3 right-3 flex items-center gap-2'>
                <button
                  onClick={() => handleOpenEditModal(product)}
                  aria-label={`Edit ${product.name}`}>
                  <SquarePen className='w-7 h-7 text-blue-500' />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  aria-label={`Delete ${product.name}`}>
                  <Trash2 className='w-7 h-7 text-red-500' />
                </button>
              </div>
              <div className='flex flex-col items-center'>
                <Image
                  src={`https://picsum.photos/id/${index + 1}/150`}
                  alt={product?.name}
                  width={150}
                  height={150}
                  className='mb-3 rounded-2xl w-36 h-36'
                />
                <h3 className='text-lg text-gray-900 font-semibold'>
                  {product?.name}
                </h3>
                <p className='text-gray-800'>
                  Price: ${product?.price.toFixed(3)} VNĐ
                </p>
                <div className='text-sm text-gray-600 mt-1'>
                  Stock: {product?.stockQuantity.toLocaleString()}
                </div>
                {product?.rating && (
                  <div className='flex items-center mt-2'>
                    <Rating rating={product?.rating} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL CREATE PRODUCT */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

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
