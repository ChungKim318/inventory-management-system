import { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const { productId, name, price, rating, stockQuantity } = req.body;
    const product = await prisma.products.create({
      data: {
        productId,
        name,
        price,
        rating,
        stockQuantity,
      },
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
    const { name, price, rating, stockQuantity } = req.body;

    if (!productIdParam || Array.isArray(productIdParam)) {
      res.status(400).json({ message: 'Invalid productId' });
      return;
    }

    const productId = productIdParam;
    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(rating !== undefined ? { rating } : {}),
        ...(stockQuantity !== undefined ? { stockQuantity } : {}),
      },
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

// export const deleteProduct = async (
//   req: Request,
//   res: Response,
// ): Promise<void> => {
//   try {
//     const { productId } = req.params;

//     await prisma.products.delete({
//       where: { productId },
//     });

//     res.status(200).json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === 'P2025'
//     ) {
//       res.status(404).json({ message: 'Product not found' });
//       return;
//     }

//     if (
//       error instanceof Prisma.PrismaClientKnownRequestError &&
//       error.code === 'P2003'
//     ) {
//       res
//         .status(409)
//         .json({ message: 'Cannot delete product because it is in use' });
//       return;
//     }

//     res.status(500).json({ message: 'Error deleting product' });
//   }
// };
