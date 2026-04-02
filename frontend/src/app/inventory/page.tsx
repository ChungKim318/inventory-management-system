'use client';

import Header from '@/components/Header';
import {
  Product,
  useCreateProductMutation,
  useGetProductsQuery,
  useUpdateProductMutation,
} from '@/state/api';
import { Box } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Download, Upload } from 'lucide-react';
import React, { ChangeEvent, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const columns: GridColDef[] = [
  { field: 'productId', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 170 },
  {
    field: 'price',
    headerName: 'Price',
    width: 120,
    valueGetter: (value, row) =>
      `${new Intl.NumberFormat('vi-VN').format(row.unitPrice ?? row.price)} VNĐ`,
  },
  {
    field: 'unitOfMeasure',
    headerName: 'Unit of Measure',
    width: 100,
    valueGetter: (value, row) => row.unitOfMeasure || 'N/A',
  },
  {
    field: 'dateStocked',
    headerName: 'Date Stocked',
    width: 130,
    valueGetter: (value, row) =>
      row.dateStocked
        ? new Date(row.dateStocked).toLocaleDateString('vi-VN')
        : 'N/A',
  },
  {
    field: 'dateShipped',
    headerName: 'Date Shipped',
    width: 130,
    valueGetter: (value, row) =>
      row.dateShipped
        ? new Date(row.dateShipped).toLocaleDateString('vi-VN')
        : 'N/A',
  },
  {
    field: 'unitPrice',
    headerName: 'Unit Price',
    width: 150,
    valueGetter: (value, row) =>
      `${new Intl.NumberFormat('vi-VN').format(row.unitPrice)} VNĐ`,
  },
  {
    field: 'stockQuantity',
    headerName: 'Stock Quantity',
    width: 150,
    valueGetter: (value, row) =>
      row.stockQuantity ? row.stockQuantity.toLocaleString() : 'N/A',
  },
  {
    field: 'stockShipped',
    headerName: 'Stock Shipped',
    width: 150,
    valueGetter: (value, row) =>
      row.stockShipped ? row.stockShipped.toLocaleString() : 'N/A',
  },
  {
    field: 'rating',
    headerName: 'Rating',
    width: 140,
    valueGetter: (value, row) => row.rating || 'N/A',
  },
];

const parseNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/,/g, '').trim();
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return NaN;
};

const normalizeKey = (key: string) =>
  key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();

const getCellValue = (
  row: Record<string, unknown>,
  aliases: string[],
): unknown => {
  const normalizedAliases = aliases.map(normalizeKey);
  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.includes(normalizeKey(key))) {
      return value;
    }
  }
  return undefined;
};

const getSelectedIdsFromModel = (selectionModel: unknown): string[] => {
  if (Array.isArray(selectionModel)) {
    return selectionModel.map((id) => String(id));
  }

  if (
    selectionModel &&
    typeof selectionModel === 'object' &&
    'ids' in selectionModel
  ) {
    const idsValue = (selectionModel as { ids?: unknown }).ids;

    if (idsValue instanceof Set) {
      return Array.from(idsValue).map((id) => String(id));
    }

    if (Array.isArray(idsValue)) {
      return idsValue.map((id) => String(id));
    }
  }

  return [];
};

const Inventory = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const { data: products, isError, isLoading } = useGetProductsQuery();

  const productById = useMemo(() => {
    return new Map(
      products?.map((product) => [product.productId, product]) ?? [],
    );
  }, [products]);

  const handleExportExcel = async () => {
    if (!products || products.length === 0) {
      toast.error('Không có dữ liệu để xuất Excel');
      return;
    }

    try {
      const XLSX = await import('xlsx');
      const productsToExport =
        selectedProductIds.length > 0
          ? products.filter((product) =>
              selectedProductIds.includes(product.productId),
            )
          : products;

      const exportData = productsToExport.map((product, index) => ({
        STT: index + 1,
        productId: product.productId,
        name: product.name,
        price: product.price,
        rating: product.rating ?? '',
        stockQuantity: product.stockQuantity,
        unitOfMeasure: product.unitOfMeasure ?? '',
        dateStocked: product.dateStocked
          ? new Date(product.dateStocked).toISOString().slice(0, 10)
          : '',
        dateShipped: product.dateShipped
          ? new Date(product.dateShipped).toISOString().slice(0, 10)
          : '',
        unitPrice: product.unitPrice ?? product.price,
        totalPrice:
          product.totalPrice ??
          (product.unitPrice ?? product.price) * product.stockQuantity,
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

      const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([output], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Đã xuất file Excel thành công');
    } catch {
      toast.error('Xuất file Excel thất bại');
    }
  };

  const handleImportExcel = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        firstSheet,
        {
          defval: '',
        },
      );

      if (rows.length === 0) {
        toast.error('File Excel không có dữ liệu');
        return;
      }

      let successCount = 0;
      let failCount = 0;
      const errorRows: string[] = [];

      for (const [index, row] of rows.entries()) {
        const importedProductId = String(
          getCellValue(row, ['productId', 'id', 'maSanPham']) ?? '',
        ).trim();
        const name = String(
          getCellValue(row, ['name', 'productName', 'tenSanPham']) ?? '',
        ).trim();
        const price = parseNumber(
          getCellValue(row, ['price', 'gia', 'unitPrice']),
        );
        const stockQuantity = parseNumber(
          getCellValue(row, ['stockQuantity', 'stock', 'quantity', 'tonKho']),
        );
        const rating = String(
          getCellValue(row, ['rating', 'danhGia']) ?? '',
        ).trim();
        const imageUrl = String(
          getCellValue(row, ['imageUrl', 'image', 'hinhAnh']) ?? '',
        ).trim();
        const unitOfMeasure = String(
          getCellValue(row, ['unitOfMeasure', 'unit', 'donViTinh']) ?? '',
        ).trim();
        const dateStocked = String(
          getCellValue(row, ['dateStocked', 'ngayNhapKho']) ?? '',
        ).trim();
        const dateShipped = String(
          getCellValue(row, ['dateShipped', 'ngayXuatKho']) ?? '',
        ).trim();
        const unitPrice = parseNumber(
          getCellValue(row, ['unitPrice', 'donGia1DonVi']),
        );
        const totalPrice = parseNumber(
          getCellValue(row, ['totalPrice', 'tongDonGia']),
        );
        const normalizedStockQuantity = Number.isNaN(stockQuantity)
          ? NaN
          : Math.trunc(stockQuantity);
        const normalizedUnitPrice = Number.isNaN(unitPrice) ? price : unitPrice;
        const normalizedTotalPrice = Number.isNaN(totalPrice)
          ? normalizedUnitPrice * normalizedStockQuantity
          : totalPrice;

        if (
          !name ||
          Number.isNaN(price) ||
          Number.isNaN(normalizedStockQuantity)
        ) {
          failCount += 1;
          errorRows.push(
            `Dòng ${index + 2}: thiếu/không đúng dữ liệu bắt buộc`,
          );
          continue;
        }

        const productId = importedProductId || crypto.randomUUID();
        const payload: Product = {
          productId,
          name,
          price: normalizedUnitPrice,
          stockQuantity: normalizedStockQuantity,
          rating: rating || undefined,
          imageUrl: imageUrl || undefined,
          unitOfMeasure: unitOfMeasure || undefined,
          dateStocked: dateStocked || undefined,
          dateShipped: dateShipped || undefined,
          unitPrice: normalizedUnitPrice,
          totalPrice: normalizedTotalPrice,
        };

        try {
          if (importedProductId && productById.has(importedProductId)) {
            await updateProduct(payload).unwrap();
          } else {
            await createProduct({
              productId: payload.productId,
              name: payload.name,
              price: payload.price,
              stockQuantity: payload.stockQuantity,
              rating: payload.rating,
              imageUrl: payload.imageUrl,
              unitOfMeasure: payload.unitOfMeasure,
              dateStocked: payload.dateStocked,
              dateShipped: payload.dateShipped,
              unitPrice: payload.unitPrice,
              totalPrice: payload.totalPrice,
            }).unwrap();
          }
          successCount += 1;
        } catch (error: unknown) {
          failCount += 1;
          const apiError =
            typeof error === 'object' &&
            error !== null &&
            'data' in error &&
            typeof (error as { data?: unknown }).data === 'object' &&
            (error as { data?: { message?: string } }).data?.message
              ? (error as { data?: { message?: string } }).data?.message
              : 'Lỗi API';
          errorRows.push(`Dòng ${index + 2}: ${apiError}`);
        }
      }

      if (successCount > 0) {
        toast.success(`Import thành công ${successCount} dòng vào database`);
      }
      if (failCount > 0) {
        toast.error(
          `${failCount} dòng import thất bại (thiếu dữ liệu hoặc lỗi API)`,
        );
        console.error('Import lỗi chi tiết:', errorRows);
      }
    } catch {
      toast.error('Đọc file Excel thất bại');
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className='w-10 h-10 border-4 border-blue-500 rounded-full animate-spin border-t-transparent'></div>
    );
  }

  if (isError || !products) {
    return (
      <div className='py-5 text-center text-red-500'>
        Failed to loading Products
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <Header name='Inventory' />

      <div className='flex items-center justify-end gap-3 mt-2'>
        <input
          ref={fileInputRef}
          type='file'
          accept='.xlsx,.xls'
          className='hidden'
          onChange={handleImportExcel}
        />

        <button
          type='button'
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className='inline-flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300'>
          <Upload className='w-4 h-4' />
          {isImporting ? 'Đang import...' : 'Import Excel'}
        </button>
        <button
          type='button'
          onClick={handleExportExcel}
          disabled={products.length === 0}
          className='inline-flex items-center gap-2 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300'>
          <Download className='w-4 h-4' />
          Export Excel
        </button>
      </div>

      <Box sx={{ mt: 2 }}>
        <DataGrid
          rows={products}
          columns={columns}
          getRowId={(row) => row.productId}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) =>
            setSelectedProductIds(getSelectedIdsFromModel(newSelection))
          }
          showToolbar
          slotProps={{
            toolbar: {
              printOptions: { disableToolbarButton: true },
              csvOptions: { disableToolbarButton: true },
            },
          }}
          className='bg-white shadow rounded-lg border border-gray-200 mt-5 text-gray-700!'
        />
      </Box>
    </div>
  );
};

export default Inventory;
