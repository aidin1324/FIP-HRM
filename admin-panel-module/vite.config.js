import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@tailwindConfig': path.resolve(__dirname, 'tailwind.config.js'),
      // Дедупликация React - используем единственную копию
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'scheduler': path.resolve(__dirname, './node_modules/scheduler')
    },
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: [
      '@tailwindConfig',
      'react', 
      'react-dom',
      '@testing-library/react'
    ],
    esbuildOptions: {
      loader: { '.js': 'jsx' }
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Улучшение работы с чанками для динамических импортов
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          pages: ['./src/pages/Dashboard.jsx', './src/pages/Requests.jsx']
        }
      }
    }
  },
  // Добавляем возможность использовать исходный код при отладке
  server: {
    fs: {
      strict: false
    }
  }
})
