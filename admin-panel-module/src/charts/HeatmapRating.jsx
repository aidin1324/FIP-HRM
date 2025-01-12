import React, { useRef, useEffect } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { useThemeProvider } from '../utils/ThemeContext';
import { tailwindConfig } from '../utils/Utils';
import { chartColors } from './ChartjsConfig';

Chart.register(CategoryScale, LinearScale, Tooltip, Legend, BarElement);

function HeatmapChartRating({ data }) {
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    if (!ctx) return;

    // Axis & grid colors based on theme
    const axisLabelColor = darkMode
      ? tailwindConfig().theme.colors.gray[100]
      : tailwindConfig().theme.colors.gray[900];
    const gridColor = darkMode
      ? tailwindConfig().theme.colors.gray[700]
      : tailwindConfig().theme.colors.gray[200];

    // Tooltip colors based on theme
    const tooltipStyles = {
      backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
      bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
      borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
    };

    const dayLabels = Object.keys(data.ratings).sort();
    const hourLabels = [...Array(24).keys()].map((h) => `${h}:00`);

    const datasetValues = dayLabels.map((day) =>
      hourLabels.map((hour) => data.ratings[day][hour] || 0)
    );

    // Create a color scale based on rating values
    const backgroundColors = datasetValues.map((dayData) =>
      dayData.map((rating) => {
        const intensity = rating / 5;
        return `rgba(59, 130, 246, ${intensity || 0.1})`; // Sky color with varying opacity
      })
    );

    // Prepare data for Chart.js with grouped bars
    const chartData = {
      labels: dayLabels,
      datasets: hourLabels.map((hour, hourIdx) => ({
        label: hour,
        data: datasetValues.map((dayData) => dayData[hourIdx]),
        backgroundColor: datasetValues.map((dayData) => dayData[hourIdx] ? backgroundColors[datasetValues.indexOf(dayData)][hourIdx] : 'rgba(0,0,0,0)'),
        borderWidth: 0,
      })),
    };

    const chartInstance = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Date',
              color: axisLabelColor,
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              color: axisLabelColor,
            },
            grid: {
              color: gridColor,
            },
          },
          x: {
            stacked: true,
            beginAtZero: true,
            max: 5,
            title: {
              display: true,
              text: 'Average Rating',
              color: axisLabelColor,
              font: { size: 14, weight: 'bold' },
            },
            ticks: {
              stepSize: 0.5,
              color: axisLabelColor,
              callback: (value) => (value % 1 === 0 ? value : ''),
            },
            grid: {
              color: gridColor,
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatValueStar(context.parsed.x)}`,
            },
            backgroundColor: tooltipStyles.backgroundColor,
            bodyColor: tooltipStyles.bodyColor,
            borderColor: tooltipStyles.borderColor,
            borderWidth: 1,
            displayColors: false,
          },
          legend: {
            position: 'top',
            labels: {
              color: axisLabelColor,
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [data, darkMode, tooltipBgColor, tooltipBodyColor, tooltipBorderColor]);

  // Utility function to convert hex to RGB
  function hexToRGB(hex) {
    hex = hex.replace('#', '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }

  return (
    <div className="relative w-full h-64 md:h-80 lg:h-96">
      <canvas ref={canvas} className="absolute inset-0" />
    </div>
  );
}

export default HeatmapChartRating;