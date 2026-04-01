import Header from '@/components/Header';
import React, { SubmitEvent, useState } from 'react';
import { v4 } from 'uuid';

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => void;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState({
    productId: v4(),
    name: '',
    price: 0,
    stockQuantity: 0,
    rating: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === 'price' || name === 'stockQuantity' || name === 'rating'
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = 'block text-sm font-medium text-gray-700';
  const inputCssStyles =
    'block w-full mb-2 p-2 border-gray-500 border-2 rounded-md';

  return (
    <div className='fixed inset-0 z-20 w-full h-full overflow-y-auto bg-black/40 bg-opacity-50 backdrop-blur-sm'>
      <div className='relative p-5 mx-auto bg-white border rounded-md shadow-lg top-20 w-96'>
        <Header name='Create New Product' />
        <form onSubmit={handleSubmit} className='mt-5'>
          <label htmlFor='productName' className={labelCssStyles}>
            Product Name
          </label>
          <input
            type='text'
            name='name'
            placeholder='Name'
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          <label htmlFor='productPrice' className={labelCssStyles}>
            Price
          </label>
          <input
            type='number'
            name='price'
            placeholder='Price'
            onChange={handleChange}
            value={formData.price}
            className={inputCssStyles}
            required
          />

          <label htmlFor='stockQuantity' className={labelCssStyles}>
            Stock Quantity
          </label>
          <input
            type='number'
            name='stockQuantity'
            placeholder='Stock Quantity'
            onChange={handleChange}
            value={formData.stockQuantity}
            className={inputCssStyles}
            required
          />

          <label htmlFor='rating' className={labelCssStyles}>
            Rating
          </label>
          <input
            type='number'
            name='rating'
            placeholder='Rating'
            onChange={handleChange}
            value={formData.rating}
            className={inputCssStyles}
            required
          />

          <button
            type='submit'
            className='mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'>
            Create
          </button>
          <button
            onClick={onClose}
            type='button'
            className='ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700'>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
