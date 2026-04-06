import Header from '@/components/Header';
import React, { SubmitEvent, useMemo, useState } from 'react';

type ProductFormData = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  shippedQuantity?: number;
  rating: string;
  imageUrl?: string;
  unitOfMeasure?: string;
  dateStocked?: string;
  dateShipped?: string;
  unitPrice: number;
  totalPrice: number;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => void;
};

const formatVnd = (value: number) => {
  if (!Number.isFinite(value)) return '';
  return new Intl.NumberFormat('vi-VN').format(value);
};

const parseVnd = (value: string) => {
  const normalized = value.replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onSubmit,
}: CreateProductModalProps) => {
  const initialFormData: ProductFormData = {
    productId: '',
    name: '',
    price: 0,
    stockQuantity: 0,
    rating: '',
    imageUrl: '',
    unitOfMeasure: '',
    dateStocked: '',
    dateShipped: '',
    unitPrice: 0,
    totalPrice: 0,
  };

  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [unitPriceInput, setUnitPriceInput] = useState('');
  const [stockQuantityInput, setStockQuantityInput] = useState('');

  const resetForm = () => {
    setFormData(initialFormData);
    setUnitPriceInput('');
    setStockQuantityInput('');
  };

  const unitPriceDisplay = useMemo(
    () => formatVnd(formData.unitPrice),
    [formData.unitPrice],
  );
  const totalPriceDisplay = useMemo(
    () => formatVnd(formData.totalPrice),
    [formData.totalPrice],
  );

  const handleUnitPriceFocus = () => {
    if (formData.unitPrice > 0) {
      setUnitPriceInput(String(formData.unitPrice));
    }
  };

  const handleUnitPriceBlur = () => {
    if (formData.unitPrice > 0) {
      setUnitPriceInput(formatVnd(formData.unitPrice));
    } else {
      setUnitPriceInput('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'unitPrice') {
      // Keep raw typing while editing to avoid thousand-separator cursor jump.
      const raw = value.replace(/[^\d]/g, '');
      setUnitPriceInput(raw);
      const unitPrice = parseVnd(raw);
      setFormData((prev) => {
        const totalPrice = unitPrice * prev.stockQuantity;
        return { ...prev, unitPrice, price: unitPrice, totalPrice };
      });
      return;
    }

    if (name === 'stockQuantity') {
      const raw = value.replace(/[^\d]/g, '');
      setStockQuantityInput(raw);
      const stockQuantity = raw ? Math.max(0, Math.trunc(Number(raw))) : 0;
      setFormData((prev) => {
        const totalPrice = stockQuantity * prev.unitPrice;
        return { ...prev, stockQuantity, totalPrice };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      productId: formData.productId.trim(),
      name: formData.name.trim(),
      rating: formData.rating.trim(),
      imageUrl: formData.imageUrl?.trim() || undefined,
      unitOfMeasure: formData.unitOfMeasure?.trim() || undefined,
      dateStocked: formData.dateStocked || undefined,
      dateShipped: formData.dateShipped || undefined,
      price: formData.unitPrice,
      shippedQuantity: 0,
    });
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = 'block text-sm font-medium text-gray-700';
  const inputCssStyles =
    'block w-full mb-2 p-2 border-gray-500 border-2 rounded-md';

  return (
    <div className='fixed inset-0 z-20 w-full h-full overflow-y-auto bg-black/40 bg-opacity-50 backdrop-blur-sm'>
      <div className='relative p-5 mx-auto bg-white border rounded-md shadow-lg top-8 w-140 max-w-[95vw]'>
        <Header name='Tạo sản phẩm mới' />
        <form onSubmit={handleSubmit} className='mt-5 grid grid-cols-2 gap-x-4'>
          <div className='col-span-2'>
            <label htmlFor='productId' className={labelCssStyles}>
              Mã Sản phẩm
            </label>
            <input
              type='text'
              name='productId'
              placeholder='VD: SP001'
              onChange={handleChange}
              value={formData.productId}
              className={inputCssStyles}
              required
              autoComplete='off'
            />
          </div>

          <div className='col-span-2'>
            <label htmlFor='name' className={labelCssStyles}>
              Tên sản phẩm
            </label>
            <input
              type='text'
              name='name'
              placeholder='Tên sản phẩm'
              onChange={handleChange}
              value={formData.name}
              className={inputCssStyles}
              required
              autoComplete='off'
            />
          </div>

          <div>
            <label htmlFor='stockQuantity' className={labelCssStyles}>
              Số lượng nhập kho
            </label>
            <input
              type='text'
              inputMode='numeric'
              name='stockQuantity'
              placeholder='0'
              onChange={handleChange}
              value={stockQuantityInput}
              className={inputCssStyles}
              required
              autoComplete='off'
            />
          </div>

          <div>
            <label htmlFor='unitOfMeasure' className={labelCssStyles}>
              Đơn vị tính
            </label>
            <input
              type='text'
              name='unitOfMeasure'
              placeholder='cái, hộp, kg...'
              onChange={handleChange}
              value={formData.unitOfMeasure}
              className={inputCssStyles}
              autoComplete='off'
            />
          </div>

          <div>
            <label htmlFor='unitPrice' className={labelCssStyles}>
              Đơn giá 1 đơn vị (VNĐ)
            </label>
            <input
              type='text'
              inputMode='numeric'
              name='unitPrice'
              placeholder='0'
              onChange={handleChange}
              onFocus={handleUnitPriceFocus}
              onBlur={handleUnitPriceBlur}
              value={
                unitPriceInput ||
                (formData.unitPrice > 0 ? unitPriceDisplay : '')
              }
              className={inputCssStyles}
              required
              autoComplete='off'
            />
          </div>

          <div>
            <label htmlFor='totalPrice' className={labelCssStyles}>
              Tổng đơn giá
            </label>
            <input
              type='text'
              name='totalPrice'
              value={totalPriceDisplay}
              className={`${inputCssStyles} bg-gray-100`}
              readOnly
            />
          </div>

          <div>
            <label htmlFor='dateStocked' className={labelCssStyles}>
              Ngày nhập kho
            </label>
            <input
              type='date'
              name='dateStocked'
              onChange={handleChange}
              value={formData.dateStocked}
              className={inputCssStyles}
            />
          </div>

          <div>
            <label htmlFor='dateShipped' className={labelCssStyles}>
              Ngày xuất kho
            </label>
            <input
              type='date'
              name='dateShipped'
              onChange={handleChange}
              value={formData.dateShipped}
              className={inputCssStyles}
            />
          </div>

          <div>
            <label htmlFor='rating' className={labelCssStyles}>
              Ghi chú
            </label>
            <input
              type='text'
              name='rating'
              placeholder='A+, 4 sao, tốt...'
              onChange={handleChange}
              value={formData.rating}
              className={inputCssStyles}
              autoComplete='off'
            />
          </div>

          <div>
            <label htmlFor='imageUrl' className={labelCssStyles}>
              URL hình ảnh (nếu có)
            </label>
            <input
              type='text'
              name='imageUrl'
              placeholder='https://...'
              onChange={handleChange}
              value={formData.imageUrl}
              className={inputCssStyles}
              autoComplete='off'
            />
          </div>

          <div className='col-span-2 mt-2'>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700'>
              Tạo sản phẩm
            </button>
            <button
              onClick={onClose}
              type='button'
              className='ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700'>
              Huỷ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export type { ProductFormData };
export default CreateProductModal;
