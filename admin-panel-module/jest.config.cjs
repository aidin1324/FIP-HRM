module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Обработка изображений и других бинарных файлов
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tailwindConfig$': '<rootDir>/tailwind.config.js',
    // Добавляем маппинги для контекстов в разных директориях
    '\\.\\./contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '\\.\\./components/(.*)$': '<rootDir>/src/components/$1',
    // Фикс для модулей
    '\\.\\./api_endpoints$': '<rootDir>/src/__mocks__/api_endpoints.jsx',
    '\\.\\.\\/\\.\\./api_endpoints$': '<rootDir>/src/__mocks__/api_endpoints.jsx',
    '\\.\\./services/apiClient$': '<rootDir>/src/__mocks__/services/apiClient.js',
    '\\.\\.\\/\\.\\./config/environment$': '<rootDir>/src/__mocks__/config/environment.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.cjs'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{spec,test}.{js,jsx}'
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(.pnpm/|.*\\.mjs$))'
  ],
  extensionsToTreatAsEsm: ['.jsx'],
  resetMocks: false
};