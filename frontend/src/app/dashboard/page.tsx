'use client';

import {
  CheckCircle,
  Package,
  Tag,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import CardPopularProducts from './CardPopularProducts';
import CardSalesSummary from './CardSalesSummary';
import CardPurchaseSummary from './CardPurchaseSummary';
import CardExpensesSummary from './CardExpensesSummary';
import StatCard from './StatCard';
import CardInventorySummary from './CardInventorySummary';

const Dashboard = () => {
  return (
    <div className='gap-10 pb-4 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto custom-grid-rows'>
      {/* <CardPopularProducts /> */}
      <CardInventorySummary />
      {/* <CardSalesSummary /> */}
      {/* <CardPurchaseSummary /> */}
      {/* <CardExpensesSummary /> */}
      {/* <StatCard
        title='Customer & Expenses'
        primaryIcon={<Package className='w-6 h-6 text-blue-600' />}
        dateRange='22 - 29 October 2023'
        details={[
          {
            title: 'Customer Growth',
            amount: '175.00',
            changePercentage: 131,
            IconComponent: TrendingUp,
          },
          {
            title: 'Expenses',
            amount: '10.00',
            changePercentage: -56,
            IconComponent: TrendingDown,
          },
        ]}
      />
      <StatCard
        title='Dues & Pending Orders'
        primaryIcon={<CheckCircle className='w-6 h-6 text-blue-600' />}
        dateRange='22 - 29 October 2023'
        details={[
          {
            title: 'Dues',
            amount: '250.00',
            changePercentage: 131,
            IconComponent: TrendingUp,
          },
          {
            title: 'Pending Orders',
            amount: '147',
            changePercentage: -56,
            IconComponent: TrendingDown,
          },
        ]}
      />
      <StatCard
        title='Sales & Discount'
        primaryIcon={<Tag className='w-6 h-6 text-blue-600' />}
        dateRange='22 - 29 October 2023'
        details={[
          {
            title: 'Sales',
            amount: '1000.00',
            changePercentage: 20,
            IconComponent: TrendingUp,
          },
          {
            title: 'Discount',
            amount: '200.00',
            changePercentage: -10,
            IconComponent: TrendingDown,
          },
        ]}
      /> */}
    </div>
  );
};

export default Dashboard;
