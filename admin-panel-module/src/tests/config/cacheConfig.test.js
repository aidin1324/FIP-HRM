import { config } from '../../config/environment';

describe('Конфигурация кэширования', () => {
  test('должна иметь настройки для кэширования', () => {
    expect(config.performance).toBeDefined();
    expect(config.performance.cacheDuration).toBeDefined();
  });

  test('должна определять правильное время кэширования для feedbackData', () => {
    // Время кэширования должно быть 15 минут (в миллисекундах)
    expect(config.performance.cacheDuration).toBe(15 * 60 * 1000);
  });

  test('должна обеспечивать разумный баланс между актуальностью и производительностью', () => {
    // Время кэширования не должно быть слишком коротким (меньше 1 минуты)
    expect(config.performance.cacheDuration).toBeGreaterThan(60 * 1000);
    
    // Время кэширования не должно быть слишком длинным (больше 1 часа)
    expect(config.performance.cacheDuration).toBeLessThan(60 * 60 * 1000);
  });
});