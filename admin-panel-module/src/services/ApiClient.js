import Cookies from 'js-cookie';

export class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async fetchCsrfToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/csrf-token`, {
        credentials: 'include' 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      
      const data = await response.json();
      return data.csrf_token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  async request(endpoint, options = {}) {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
      try {
        const csrfToken = await this.fetchCsrfToken();
        options.headers = {
          ...options.headers,
          'X-CSRF-Token': csrfToken
        };
      } catch (error) {
        console.error('Не удалось получить CSRF токен:', error);
      }
    }

    const url = `${this.baseURL}${endpoint}`;

    const token = Cookies.get('access_token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
      ...options,
      headers,
    };
    
    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        Cookies.remove('access_token');
        window.location.href = '/login';
        return Promise.reject(new Error('Сессия истекла. Пожалуйста, войдите снова.'));
      }

      if (!response.ok) {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          return Promise.reject(new Error(error.message || 'Произошла ошибка'));
        }
        return Promise.reject(new Error(`HTTP ошибка! Статус: ${response.status}`));
      }

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return response.text();
    } catch (error) {
      console.error('API запрос не выполнен:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }
  
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

const ENV = process.env.NODE_ENV || 'development';
const API_CONFIG = {
  development: { baseURL: "http://localhost:8000" },
  production: { baseURL: "https://api.your-production-domain.com" },
  test: { baseURL: "http://localhost:8000" },
};

export const apiClient = new ApiClient(API_CONFIG[ENV].baseURL);