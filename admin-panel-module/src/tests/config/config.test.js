jest.mock('../../config/environment');
import { config } from '../../config/environment';

describe('Конфигурации безопасности', () => {
  // Тест 1: Проверка базового URL API
  test('должен иметь правильный базовый URL API', () => {
    expect(config.api.baseURL).toBe('http://localhost:8000');
  });

  // Тест 2: Проверка сроков действия токенов
  test('должен определять правильные сроки действия токенов', () => {
    // Access Token - 1 день (в секундах)
    expect(config.auth.accessTokenMaxAge).toBe(60 * 60 * 24);
    
    // Refresh Token - 7 дней (в секундах)
    expect(config.auth.refreshTokenMaxAge).toBe(60 * 60 * 24 * 7);
  });

  // Тест 3: Проверка таймаута неактивности
  test('должен определять корректный таймаут неактивности', () => {
    // 30 минут в миллисекундах
    expect(config.auth.idleTimeout).toBe(30 * 60 * 1000);
  });

  // Тест 4: Проверка настроек производительности
  test('должен определять настройки производительности', () => {
    expect(config.performance.prefetchLimit).toBe(5);
    expect(config.performance.cacheDuration).toBe(15 * 60 * 1000); // 15 минут в миллисекундах
  });
});