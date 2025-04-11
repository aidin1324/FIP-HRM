import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // Включаем поддержку смешанных модулей
    },
  },
});
