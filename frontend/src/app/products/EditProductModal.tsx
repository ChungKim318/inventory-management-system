import Header from '@/components/Header';
import React, { SubmitEvent, useMemo, useState } from 'react';
import type { Product } from '@/state/api';
import type { ProductFormData } from './CreateProductModal';
import { toast } from 'sonner';

type EditProductModalProps = {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSubmit: (formData: ProductFormData) => Promise<boolean>;
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

const formatDateInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const EditProductModal = ({
  isOpen,
  product,
  onClose,
  onSubmit,
}: EditProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    productId: product?.productId ?? '',
    name: product?.name ?? '',
    price: product?.price ?? 0,
    stockQuantity: product?.stockQuantity ?? 0,
    rating: product?.rating ?? '',
    imageUrl: product?.imageUrl ?? '',
    unitOfMeasure: product?.unitOfMeasure ?? '',
    dateStocked: formatDateInput(product?.dateStocked),
    dateShipped: formatDateInput(product?.dateShipped),
    unitPrice: product?.unitPrice ?? product?.price ?? 0,
    totalPrice:
      product?.totalPrice ??
      (product?.unitPrice ?? product?.price ?? 0) *
        (product?.stockQuantity ?? 0),
  });
  const [shipQuantity, setShipQuantity] = useState(0);
  const [unitPriceInput, setUnitPriceInput] = useState('');

  const unitPriceDisplay = useMemo(
    () => formatVnd(formData.unitPrice),
    [formData.unitPrice],
  );
  const totalPriceDisplay = useMemo(
    () => formatVnd(formData.totalPrice),
    [formData.totalPrice],
  );
  const remainingStock = useMemo(() => {
    const currentStock = product?.stockQuantity ?? 0;
    return currentStock - shipQuantity;
  }, [product?.stockQuantity, shipQuantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'shipQuantity') {
      const parsedShipQuantity = Math.max(0, Math.trunc(Number(value) || 0));
      setShipQuantity(parsedShipQuantity);
      return;
    }

    if (name === 'unitPrice') {
      const raw = value.replace(/[^\d]/g, '');
      setUnitPriceInput(raw);
      const unitPrice = parseVnd(raw);
      setFormData((prev) => {
        const totalPrice = unitPrice * prev.stockQuantity;
        return { ...prev, unitPrice, price: unitPrice, totalPrice };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    if (shipQuantity > product.stockQuantity) {
      toast.error('Số lượng xuất kho không được vượt quá số lượng tồn');
      return;
    }

    const isUpdated = await onSubmit({
      ...formData,
      productId: formData.productId.trim(),
      name: formData.name.trim(),
      rating: formData.rating.trim(),
      imageUrl: formData.imageUrl?.trim() || undefined,
      unitOfMeasure: formData.unitOfMeasure?.trim() || undefined,
      dateStocked: formData.dateStocked || undefined,
      dateShipped: formData.dateShipped || undefined,
      price: formData.unitPrice,
      stockQuantity: Math.max(0, product.stockQuantity - shipQuantity),
      shippedQuantity: (product.shippedQuantity ?? 0) + shipQuantity,
      totalPrice:
        formData.unitPrice * Math.max(0, product.stockQuantity - shipQuantity),
    });
    if (isUpdated) {
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const labelCssStyles =
    'block text-sm font-medium text-gray-700 dark:text-gray-300';
  const inputCssStyles =
    'block w-full mb-2 p-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-2 rounded-md';

  return (
    <div className='fixed inset-0 z-20 w-full h-full overflow-y-auto bg-black/40 bg-opacity-50 backdrop-blur-sm'>
      <div className='relative p-5 mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg top-8 w-140 max-w-[95vw]'>
        <div className='flex justify-between items-center'>
          <Header name='Cập nhật sản phẩm' />
          <div className='flex items-center'>
            <p className='text-2xl font-semibold dark:text-gray-100'>
              Tồn sau xuất:&nbsp;
            </p>
            <span className='text-2xl font-semibold text-blue-600'>
              {remainingStock < 0 ? 0 : remainingStock}
            </span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className='mt-5 grid grid-cols-2 gap-x-4'>
          <div className='col-span-2'>
            <label htmlFor='productId' className={labelCssStyles}>
              Mã sản phẩm
            </label>
            <input
              type='text'
              name='productId'
              value={formData.productId}
              className={`${inputCssStyles} bg-gray-100 dark:bg-gray-700`}
              readOnly
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
              onChange={handleChange}
              value={formData.name}
              className={inputCssStyles}
              required
              autoComplete='off'
            />
          </div>

          <div>
            <label htmlFor='shipQuantity' className={labelCssStyles}>
              Số lượng xuất kho
            </label>
            <input
              type='number'
              min={0}
              name='shipQuantity'
              onChange={handleChange}
              value={shipQuantity}
              className={inputCssStyles}
              required
              autoComplete='off'
            />
            {/* <p className='-mt-1 mb-2 text-xs text-gray-500'>
              Tồn sau xuất: {remainingStock < 0 ? 0 : remainingStock}
            </p> */}
          </div>

          <div>
            <label htmlFor='unitOfMeasure' className={labelCssStyles}>
              Đơn vị tính
            </label>
            <input
              type='text'
              name='unitOfMeasure'
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
              Tổng đơn giá (tự động)
            </label>
            <input
              type='text'
              name='totalPrice'
              value={totalPriceDisplay}
              className={`${inputCssStyles} bg-gray-100 dark:bg-gray-700`}
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
              Cập nhật
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

export default EditProductModal;
