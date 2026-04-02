import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardMetrics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const inventoryTotals = await prisma.products.aggregate({
      _sum: {
        stockQuantity: true,
        shippedQuantity: true,
      },
    });

    const totalStockQuantity = inventoryTotals._sum.stockQuantity ?? 0;
    const totalShippedQuantity = inventoryTotals._sum.shippedQuantity ?? 0;
    const totalImportedQuantity = totalStockQuantity + totalShippedQuantity;

    const popularProducts = await prisma.products.findMany({
      take: 15,
      orderBy: {
        stockQuantity: 'desc',
      },
    });
    const salesSummary = await prisma.salesSummary.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
    });
    const purchaseSummary = await prisma.purchaseSummary.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
    });
    const expenseSummary = await prisma.expenseSummary.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
    });
    const expenseByCategorySummaryRaw = await prisma.expenseByCategory.findMany(
      {
        take: 5,
        orderBy: {
          date: 'desc',
        },
      },
    );
    const expenseByCategorySummary = expenseByCategorySummaryRaw.map(
      (item) => ({
        ...item,
        amount: item.amount.toString(),
      }),
    );

    res.json({
      inventorySummary: {
        totalImportedQuantity,
        totalShippedQuantity,
        totalStockQuantity,
      },
      popularProducts,
      salesSummary,
      purchaseSummary,
      expenseSummary,
      expenseByCategorySummary,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dashboard metrics' });
  }
};
