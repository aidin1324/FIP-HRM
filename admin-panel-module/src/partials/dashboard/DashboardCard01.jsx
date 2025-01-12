import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EditMenu from '../../components/DropdownEditMenu';
import LineChartRating from '../../charts/LineChartRating';
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import { chartAreaGradient } from '../../charts/ChartjsConfig';

function DashboardCard01() {
  // Mock data
  const mockDailyData = {
    labels: [
      '2023-09-01', '2023-09-02', '2023-09-03', '2023-09-04', '2023-09-05',
      '2023-09-06', '2023-09-07', '2023-09-08', '2023-09-09', '2023-09-10',
      '2023-09-11', '2023-09-12', '2023-09-13', '2023-09-14', '2023-09-15',
      '2023-09-16', '2023-09-17', '2023-09-18', '2023-09-19', '2023-09-20',
      '2023-09-21', '2023-09-22', '2023-09-23', '2023-09-24', '2023-09-25',
      '2023-09-26', '2023-09-27', '2023-09-28', '2023-09-29', '2023-09-30',
      '2023-10-01', '2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05',
      '2023-10-06', '2023-10-07', '2023-10-08', '2023-10-09', '2023-10-10',
      '2023-10-11', '2023-10-12', '2023-10-13', '2023-10-14', '2023-10-15',
      '2023-10-16', '2023-10-17', '2023-10-18', '2023-10-19', '2023-10-20',
      '2023-10-21', '2023-10-22', '2023-10-23', '2023-10-24', '2023-10-25',
      '2023-10-26', '2023-10-27', '2023-10-28', '2023-10-29', '2023-10-30',
      '2023-10-31', '2023-11-01', '2023-11-02', '2023-11-03', '2023-11-04',
      '2023-11-05', '2023-11-06', '2023-11-07', '2023-11-08', '2023-11-09',
    ],
    values: [
      4.5, 4.2, 4.8, 5.0, 4.1, 4.0, 4.6, 4.3, 4.7, 5.0,
      4.0, 4.1, 4.9, 4.2, 4.5, 4.4, 4.5, 4.0, 4.8, 4.4,
      4.2, 4.3, 4.0, 2.5, 4.7, 4.1, 4.2, 4.6, 4.3, 4.4,
      4.9, 4.1, 4.8, 4.5, 4.2, 4.3, 4.8, 4.2, 4.5, 5.0,
      4.1, 4.2, 4.6, 4.4, 4.5, 4.9, 4.1, 4.3, 4.7, 4.5,
      4.6, 4.8, 4.3, 4.1, 4.7, 4.2, 4.5, 4.9, 4.0, 4.0,
      4.8, 4.6, 4.4, 4.7, 4.3, 4.2, 4.8, 4.7, 4.3, 4.9,
    ],
  };
  const mockMonthlyData = {
    labels: ['January', 'February', 'March', 'April', 'May'],
    values: [3.8, 4.0, 4.1, 3.9, 4.3],
  };

  const [filterOption, setFilterOption] = useState('daily');
  const [chartData, setChartData] = useState({
    labels: mockDailyData.labels,
    datasets: [
      {
        label: 'Rating',
        data: mockDailyData.values,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return chartAreaGradient(ctx, chartArea, [
            { stop: 0, color: `rgba(${hexToRGB(tailwindConfig().theme.colors.violet[500])}, 0)` },
            { stop: 1, color: `rgba(${hexToRGB(tailwindConfig().theme.colors.violet[500])}, 0.2)` },
          ]);
        },
        borderColor: tailwindConfig().theme.colors.violet[500],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 3,
        pointBackgroundColor: tailwindConfig().theme.colors.violet[500],
        pointHoverBackgroundColor: tailwindConfig().theme.colors.violet[500],
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        tension: 0.2,
        clip: 20,
      },
    ],
  });

  // Switch between "daily" and "monthly" data
  const handleFilterChange = (option) => {
    setFilterOption(option);
    if (option === 'daily') {
      setChartData({
        labels: mockDailyData.labels,
        datasets: [
          {
            ...chartData.datasets[0],
            data: mockDailyData.values,
          },
        ],
      });
    } else if (option === 'monthly') {
      setChartData({
        labels: mockMonthlyData.labels,
        datasets: [
          {
            ...chartData.datasets[0],
            data: mockMonthlyData.values,
          },
        ],
      });
    }
  };

  // Calculate average (just a demo metric)
  const averageRating = chartData.datasets[0].data.length
    ? (
        chartData.datasets[0].data.reduce((total, rating) => total + rating, 0) /
        chartData.datasets[0].data.length
      ).toFixed(2)
    : 'N/A';

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-gray-800 shadow-sm rounded-xl p-4">
      <header className="flex justify-between items-start mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Waiter Rating Over Time
        </h2>
        <EditMenu align="right" className="relative inline-flex">
          <li>
            <Link
              className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3"
              to="#0"
              onClick={() => handleFilterChange('daily')}
            >
              Daily
            </Link>
          </li>
          <li>
            <Link
              className="font-medium text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 flex py-1 px-3"
              to="#0"
              onClick={() => handleFilterChange('monthly')}
            >
              Monthly
            </Link>
          </li>
          <li>
            <Link
              className="font-medium text-sm text-red-500 hover:text-red-600 flex py-1 px-3"
              to="#0"
              onClick={() => {
                setFilterOption('daily');
                setChartData({
                  labels: mockDailyData.labels,
                  datasets: [
                    {
                      ...chartData.datasets[0],
                      data: mockDailyData.values,
                    },
                  ],
                });
              }}
            >
              Remove
            </Link>
          </li>
        </EditMenu>
      </header>

      {/* Current Metrics */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase">
            Average Rating
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {averageRating}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase">
            Total Entries
          </span>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {chartData.datasets[0].data.length}
          </span>
        </div>
      </div>

      {/* Line Chart */}
      <div className="flex-grow h-64">
        <LineChartRating data={chartData} />
      </div>
    </div>
  );
}

export default DashboardCard01;