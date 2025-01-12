import React from 'react';
import BarChart from '../../charts/BarChartRating';

// Import utilities
import { tailwindConfig } from '../../utils/Utils';

function DashboardCard06({ categoryData }) {
  // Mock data if categoryData is not provided
  const mockCategoryData = [
    { category: 'Category 1', meanRating: 4 },
    { category: 'Category 2', meanRating: 3.5 },
  ];

  const dataToUse = categoryData && categoryData.length > 0 ? categoryData : mockCategoryData;

  const chartData = {
    labels: dataToUse.map(item => item.category),
    datasets: [
      {
        label: 'Mean Rating',
        data: dataToUse.map(item => item.meanRating),
        backgroundColor: [
          tailwindConfig().theme.colors.violet[500],
          tailwindConfig().theme.colors.sky[500],
        ],
        hoverBackgroundColor: [
          tailwindConfig().theme.colors.violet[600],
          tailwindConfig().theme.colors.sky[600],
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Average Ratings by Category</h2>
      </header>
      <div className="p-3">
        <BarChart data={chartData} width={600} height={400} />
      </div>
    </div>
  );
}

export default DashboardCard06;