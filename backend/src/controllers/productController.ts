import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const parseOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseOptionalDate = (value: unknown): Date | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const getProducts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const search = req.query.search?.toString();
    const products = await prisma.products.findMany({
      where: {
        name: {
          contains: search || '', // If search is undefined, use an empty string to return all products
        },
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products' });
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      productId,
      name,
      price,
      rating,
      stockQuantity,
      shippedQuantity,
      imageUrl,
      unitOfMeasure,
      dateStocked,
      dateShipped,
      unitPrice,
      totalPrice,
    } = req.body;

    if (!productId || !name) {
      res.status(400).json({ message: 'productId and name are required' });
      return;
    }

    const parsedPrice = parseOptionalNumber(price);
    const parsedStockQuantity = parseOptionalNumber(stockQuantity);
    const parsedShippedQuantity = parseOptionalNumber(shippedQuantity);

    if (parsedPrice === undefined || parsedStockQuantity === undefined) {
      res.status(400).json({ message: 'price and stockQuantity must be number' });
      return;
    }

    const createData: Prisma.ProductsCreateInput = {
      productId: String(productId),
      name: String(name),
      price: parsedPrice,
      stockQuantity: Math.trunc(parsedStockQuantity),
      shippedQuantity:
        parsedShippedQuantity !== undefined
          ? Math.trunc(parsedShippedQuantity)
          : 0,
    };

    if (rating !== undefined && rating !== null && rating !== '') {
      createData.rating = String(rating);
    }
    if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') {
      createData.imageUrl = String(imageUrl);
    }
    if (
      unitOfMeasure !== undefined &&
      unitOfMeasure !== null &&
      unitOfMeasure !== ''
    ) {
      createData.unitOfMeasure = String(unitOfMeasure);
    }

    const parsedDateStocked = parseOptionalDate(dateStocked);
    if (parsedDateStocked) createData.dateStocked = parsedDateStocked;

    const parsedDateShipped = parseOptionalDate(dateShipped);
    if (parsedDateShipped) createData.dateShipped = parsedDateShipped;

    const parsedUnitPrice = parseOptionalNumber(unitPrice);
    if (parsedUnitPrice !== undefined) createData.unitPrice = parsedUnitPrice;

    const parsedTotalPrice = parseOptionalNumber(totalPrice);
    if (parsedTotalPrice !== undefined) createData.totalPrice = parsedTotalPrice;

    const product = await prisma.products.create({
      data: createData,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
};

export const editProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productIdParam = req.params.productId;
    const {
      name,
      price,
      rating,
      stockQuantity,
      shippedQuantity,
      imageUrl,
      unitOfMeasure,
      dateStocked,
      dateShipped,
      unitPrice,
      totalPrice,
    } = req.body;

    if (!productIdParam || Array.isArray(productIdParam)) {
      res.status(400).json({ message: 'Invalid productId' });
      return;
    }

    const productId = productIdParam;
    const updateData: Prisma.ProductsUpdateInput = {};

    if (name !== undefined) updateData.name = String(name);
    if (price !== undefined) updateData.price = Number(price);
    if (rating !== undefined) updateData.rating = rating ? String(rating) : null;
    if (stockQuantity !== undefined) {
      const parsedStockQuantity = Math.trunc(Number(stockQuantity));
      if (parsedStockQuantity < 0) {
        res
          .status(400)
          .json({ message: 'stockQuantity cannot be less than 0' });
        return;
      }
      updateData.stockQuantity = parsedStockQuantity;
    }
    if (shippedQuantity !== undefined) {
      const parsedShippedQuantity = Math.trunc(Number(shippedQuantity));
      if (parsedShippedQuantity < 0) {
        res
          .status(400)
          .json({ message: 'shippedQuantity cannot be less than 0' });
        return;
      }
      updateData.shippedQuantity = parsedShippedQuantity;
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl ? String(imageUrl) : null;
    }
    if (unitOfMeasure !== undefined) {
      updateData.unitOfMeasure = unitOfMeasure ? String(unitOfMeasure) : null;
    }
    if (dateStocked !== undefined) {
      updateData.dateStocked = parseOptionalDate(dateStocked) ?? null;
    }
    if (dateShipped !== undefined) {
      updateData.dateShipped = parseOptionalDate(dateShipped) ?? null;
    }
    if (unitPrice !== undefined) {
      const parsed = parseOptionalNumber(unitPrice);
      updateData.unitPrice = parsed ?? null;
    }
    if (totalPrice !== undefined) {
      const parsed = parseOptionalNumber(totalPrice);
      updateData.totalPrice = parsed ?? null;
    }

    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: updateData,
    });

    res.json(updatedProduct);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(500).json({ message: 'Error updating product' });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const productIdParam = req.params.productId;
    if (!productIdParam || Array.isArray(productIdParam)) {
      res.status(400).json({ message: 'Invalid productId' });
      return;
    }
    const productId = productIdParam;

    await prisma.products.delete({
      where: { productId },
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      res
        .status(409)
        .json({ message: 'Cannot delete product because it is in use' });
      return;
    }

    res.status(500).json({ message: 'Error deleting product' });
  }
};
