export const config = {
  api: {
    baseURL: 'http://localhost:8000'
  },
  auth: {
    accessTokenMaxAge: 86400, // 1 день в секундах
    refreshTokenMaxAge: 604800, // 7 дней в секундах
    idleTimeout: 1800000 // 30 минут в миллисекундах
  },
  performance: {
    prefetchLimit: 5,
    cacheDuration: 900000 // 15 минут в миллисекундах
  }
};