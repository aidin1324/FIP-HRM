import axios from 'axios';

const cacheManager = {
  storage: new Map(), 
  get(key) {
    if (!this.storage.has(key)) return null;
    
    const item = this.storage.get(key);
    if (item.expires && item.expires < Date.now()) {
      this.storage.delete(key);
      return null;
    }
    return item.data;
  },

  set(key, data, maxAge) {
    this.storage.set(key, {
      data,
      expires: maxAge ? Date.now() + maxAge : null
    });

    if (this.storage.size > 100) this.cleanup();
  },

  cleanup() {
    const MAX_CACHE_SIZE = 15 * 1024 * 1024; 
    if (this.getSize() > MAX_CACHE_SIZE) {
      console.log('Кэш слишком большой, очищаем старые записи');
      this.clear();
      return;
    }
    const now = Date.now();
    for (const [key, value] of this.storage.entries()) {
      if (value.expires && value.expires < now) {
        this.storage.delete(key);
      }
    }
  },
  
  remove(key) {
    this.storage.delete(key);
  },

  clear() {
    this.storage.clear();
  },

  getSize() {
    let size = 0;
    for (const [_, value] of this.storage.entries()) {
      size += JSON.stringify(value.data).length;
    }
    return size;
  }
};

const client = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api.your-production-domain.com' 
    : 'http://localhost:8000',
  timeout: 15000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

client.interceptors.request.use(
  config => {
    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const token = JSON.parse(auth).access_token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('Ошибка при добавлении токена:', e);
    }

    config.headers['Accept-Encoding'] = 'gzip, deflate, br';
    
    return config;
  },
  error => Promise.reject(error)
);

client.interceptors.response.use(
  response => {
    if (response.config.method === 'get' && response.config.cache !== false) {
      const cacheKey = `${response.config.url}|${JSON.stringify(response.config.params || {})}`;
      const maxAge = response.config.cacheMaxAge || 60000;

      cacheManager.set(cacheKey, response.data, maxAge);
    }
    
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const originalGet = client.get;
client.get = function(url, config = {}) {
  if (config.cache !== false) {
    const cacheKey = `${url}|${JSON.stringify(config.params || {})}`;
    const cachedData = cacheManager.get(cacheKey);
    
    if (cachedData) {
      console.log(`[Cache Hit] ${url}`);
      return Promise.resolve({ data: cachedData, status: 200, cached: true });
    }
  }

  return originalGet(url, config);
};

client.clearCache = cacheManager.clear.bind(cacheManager);
client.removeFromCache = cacheManager.remove.bind(cacheManager);

export default client;