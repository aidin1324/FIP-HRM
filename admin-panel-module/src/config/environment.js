// Используйте переменные окружения через .env файлы для Vite

// .env.development
// VITE_API_BASE_URL=http://localhost:8000

// .env.production
// VITE_API_BASE_URL=https://api.your-production-domain.com

export const config = {
  api: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  },
  auth: {
    accessTokenMaxAge: 60 * 60 * 24, // 1 день в секундах
    refreshTokenMaxAge: 60 * 60 * 24 * 7, // 7 дней в секундах
    idleTimeout: 30 * 60 * 1000, // 30 минут неактивности до автоматического выхода (в миллисекундах)
  },
  performance: {
    prefetchLimit: 5, // Максимальное количество запросов для предварительной загрузки
    cacheDuration: 15 * 60 * 1000, // Срок хранения кэша (15 минут)
  }
};