import React, { useRef, useEffect } from 'react';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-moment';
import { tailwindConfig, formatValueStar } from '../utils/Utils';
import { useThemeProvider } from '../utils/ThemeContext';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function BarChartRating({ data }) {
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;

    // Axis & grid colors
    const axisLabelColor = darkMode
      ? tailwindConfig().theme.colors.gray[100]
      : tailwindConfig().theme.colors.gray[900];

    const gridColor = darkMode
      ? tailwindConfig().theme.colors.gray[700]
      : tailwindConfig().theme.colors.gray[200];

    // Tooltip colors
    let tooltipBgColor, tooltipTitleColor, tooltipBodyColor;
    if (darkMode) {
      tooltipBgColor = tailwindConfig().theme.colors.gray[900];
      tooltipTitleColor = '#fff';
      tooltipBodyColor = '#fff';
    } else {
      tooltipBgColor = tailwindConfig().theme.colors.gray[200];
      tooltipTitleColor = '#000';
      tooltipBodyColor = '#000';
    }

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels || [],
        datasets: data.datasets || [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 16,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: tooltipBgColor,
            titleColor: tooltipTitleColor,
            bodyColor: tooltipBodyColor,
            displayColors: false,
            borderWidth: 0,
            callbacks: {
              label: (context) => `Mean Rating: ${formatValueStar(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: 'Categories',
              color: axisLabelColor,
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              color: axisLabelColor,
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            min: 0,
            max: 5,
            ticks: {
              stepSize: 0.5,
              callback: (value) => {
                // Only show whole numbers on axis
                if (value % 1 === 0) return formatValueStar(value);
                return '';
              },
              color: axisLabelColor,
            },
            grid: {
              color: gridColor,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [data, darkMode]);

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96">
      <canvas ref={canvas} className="absolute inset-0" />
    </div>
  );
}

export default BarChartRating;