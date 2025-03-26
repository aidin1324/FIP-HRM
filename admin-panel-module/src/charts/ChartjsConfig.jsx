// Import Chart.js
import { Chart, registerables } from 'chart.js';
// Import Tailwind config
import { tailwindConfig, hexToRGB } from '../utils/Utils';

Chart.register(...registerables);

Chart.defaults.font.family = '"Inter", sans-serif';
Chart.defaults.font.weight = '500';
Chart.defaults.color = '#94a3b8';
Chart.defaults.scale.grid.color = '#f1f5f9';
Chart.defaults.plugins.tooltip.titleColor = '#1e293b';
Chart.defaults.plugins.tooltip.bodyColor = '#1e293b';
Chart.defaults.plugins.tooltip.backgroundColor = '#ffffff';
Chart.defaults.plugins.tooltip.borderColor = '#e2e8f0';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 4;
Chart.defaults.plugins.tooltip.padding = 8;
Chart.defaults.plugins.tooltip.displayColors = false;

const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const userPrefersDark = localStorage.getItem('dark-mode') === 'true';
export const isDark = userPrefersDark || systemPrefersDark;

if (isDark) {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.scale.grid.color = '#334155';
  Chart.defaults.plugins.tooltip.titleColor = '#f1f5f9';
  Chart.defaults.plugins.tooltip.bodyColor = '#f1f5f9';
  Chart.defaults.plugins.tooltip.backgroundColor = '#1e293b';
  Chart.defaults.plugins.tooltip.borderColor = '#475569';
}

export const chartAreaGradient = (ctx, chartArea, colorStops) => {
  if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
    return 'transparent';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  colorStops.forEach(({ stop, color }) => {
    gradient.addColorStop(stop, color);
  });
  return gradient;
};

export const chartColors = {
  textColor: {
    light: tailwindConfig().theme.colors.gray[400],
    dark: tailwindConfig().theme.colors.gray[500],
  },
  gridColor: {
    light: tailwindConfig().theme.colors.gray[100],
    dark: `rgba(${hexToRGB(tailwindConfig().theme.colors.gray[700])}, 0.6)`,
  },
  backdropColor: {
    light: tailwindConfig().theme.colors.white,
    dark: tailwindConfig().theme.colors.gray[800],
  },
  tooltipTitleColor: {
    light: tailwindConfig().theme.colors.gray[800],
    dark: tailwindConfig().theme.colors.gray[100],
  },
  tooltipBodyColor : {
    light: tailwindConfig().theme.colors.gray[500],
    dark: tailwindConfig().theme.colors.gray[400]
  },
  tooltipBgColor: {
    light: tailwindConfig().theme.colors.white,
    dark: tailwindConfig().theme.colors.gray[700],
  },
  tooltipBorderColor: {
    light: tailwindConfig().theme.colors.gray[200],
    dark: tailwindConfig().theme.colors.gray[600],
  },
};
