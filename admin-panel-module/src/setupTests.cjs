import { TextEncoder, TextDecoder } from 'util';

require('@testing-library/jest-dom');
require('regenerator-runtime/runtime');

// Настройка текстового энкодера/декодера для react-router
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Мок для файлов изображений
Object.defineProperty(global.Image.prototype, 'src', {
  set: function() { 
    // Эмуляция загрузки изображения
    setTimeout(() => this.onload && this.onload(), 100);
  }
});

// Мок для React 
const React = require('react');
global.React = React;

// Изменим способ мокирования sessionStorage для избежания конфликтов
const sessionStorageValues = {};

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(key => sessionStorageValues[key] || null),
    setItem: jest.fn((key, value) => {
      sessionStorageValues[key] = value;
    }),
    removeItem: jest.fn(key => {
      delete sessionStorageValues[key];
    }),
    clear: jest.fn(() => {
      Object.keys(sessionStorageValues).forEach(key => {
        delete sessionStorageValues[key];
      });
    })
  },
  writable: true
});

// Устанавливаем методы для Storage.prototype, чтобы работали jest.spyOn
Storage.prototype.getItem = jest.fn();
Storage.prototype.setItem = jest.fn();
Storage.prototype.removeItem = jest.fn();
Storage.prototype.clear = jest.fn();

// Правильный мок для localStorage
let localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(() => null)
  };
})();

// Переопределение localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: false
});

// Мок для IntersectionObserver
class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    this.entries = [];
  }

  observe(element) {
    this.elements.add(element);
    // Имитируем пересечение элемента сразу
    if (element && element.dataset) {
      const entry = {
        isIntersecting: true,
        target: element,
        dataset: element.dataset,
        intersectionRatio: 1
      };
      this.callback([entry]);
    }
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }
}

// Установка мока IntersectionObserver
global.IntersectionObserver = IntersectionObserverMock;

// Добавляем полифилл для модульных тестов роутера
window.matchMedia = window.matchMedia || (() => {
  return {
    matches: false,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    onchange: null,
  };
});

// Добавим моки для Location с pathname
window.matchMedia = window.matchMedia || (() => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {},
}));

// Добавим правильный мок для navigate
window.location = {
  ...window.location,
  pathname: '/',
  search: '',
  hash: '',
  replace: jest.fn(),
  assign: jest.fn(),
  reload: jest.fn()
};

// Добавляем мок для createElement для svg элементов
const originalCreateElement = document.createElement.bind(document);
document.createElement = (tagName) => {
  if (tagName === 'svg') {
    const svg = originalCreateElement(tagName);
    svg.createSVGRect = () => {};
    return svg;
  }
  return originalCreateElement(tagName);
};

// Мок для jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn((token) => {
    if (!token || token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    // Пытаемся распарсить, если токен в формате с точками
    if (token.includes('.')) {
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          return payload;
        }
      } catch (e) {
        // Игнорируем ошибку
      }
    }
    // Возвращаем тестовые данные по умолчанию
    return {
      sub: '123',
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 3600 // Срок действия 1 час
    };
  })
}));

// Добавление полифилла для Buffer
global.Buffer = global.Buffer || require('buffer').Buffer;

// Создаем правильные моки для react-router-dom
jest.mock('react-router-dom', () => {
  const reactRouterDom = jest.requireActual('react-router-dom');
  return {
    ...reactRouterDom,
    Navigate: function({ to }) { 
      const div = document.createElement('div'); 
      div.setAttribute('data-testid', `navigate-to-${to.replace(/\//g, '-')}`); 
      div.textContent = `Redirecting to ${to}`; 
      return div; 
    },
    useLocation: () => ({ pathname: '/dashboard', search: '', hash: '', state: null }),
    useNavigate: () => jest.fn(),
    Link: function({ to, children }) { 
      const a = document.createElement('a'); 
      a.href = to; 
      // В этой реализации children игнорируются, но в реальном сценарии 
      // пришлось бы обрабатывать их особым образом
      return a; 
    },
    useParams: () => ({})
  };
});

/*
// Настройка моков для валидации токена
jest.mock('./contexts/AuthContext', () => {
  const actual = jest.requireActual('./contexts/AuthContext');
  return {
    ...actual,
    validateToken: jest.fn().mockReturnValue(true)
  };
}, { virtual: true });
*/

export default defineConfig({
  optimizeDeps: {
    include: ['lodash', 'moment'], // Добавьте проблемные библиотеки
  },
});