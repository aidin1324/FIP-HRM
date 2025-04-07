import client from "./ApiClient";
import { CACHE_CONFIG, get_roles_path, get_user_path } from "../api_endpoints";

const requestManager = (() => {
  const MAX_CONCURRENT = 6;  
  let activeRequests = 0;
  const queue = [];
  const activeRequestMap = new Map(); 

  function getActiveRequest(requestKey) {
    if (activeRequestMap.has(requestKey)) {
      return activeRequestMap.get(requestKey);
    }
    return null;
  }
  
  function setActiveRequest(requestKey, promiseHandler) {
    activeRequestMap.set(requestKey, promiseHandler);
    setTimeout(() => {
      activeRequestMap.delete(requestKey);
    }, 30000);
  }
  
  function processQueue() {
    while (activeRequests < MAX_CONCURRENT && queue.length > 0) {
      const { key, request, resolve, reject } = queue.shift();
      const activeRequest = key ? getActiveRequest(key) : null;
      if (activeRequest) {
        activeRequest.then(resolve).catch(reject);
        continue;
      }
      
      activeRequests++;

      const promiseHandler = new Promise((innerResolve, innerReject) => {
        request()
          .then(response => {
            innerResolve(response);
            resolve(response);
          })
          .catch(error => {
            innerReject(error);
            reject(error);
          })
          .finally(() => {
            activeRequests--;
            setTimeout(processQueue, 0); 
          });
      });
      if (key) {
        setActiveRequest(key, promiseHandler);
      }
    }
  }
  
  function enqueue(requestFn, key = null, priority = false) {
    return new Promise((resolve, reject) => {
      if (key) {
        const activeRequest = getActiveRequest(key);
        if (activeRequest) {
          return activeRequest.then(resolve).catch(reject);
        }
      }
      
      const item = { key, request: requestFn, resolve, reject };
      
      if (priority) {
        queue.unshift(item);
      } else {
        queue.push(item);
      }
      
      processQueue();
    });
  }
  
  return { enqueue };
})();

export const apiService = {
  get: (url, params = {}, options = {}) => {
    const requestKey = `GET:${url}|${JSON.stringify(params)}`;
    
    return requestManager.enqueue(() => {
      const endpoint = url.replace(client.defaults.baseURL || '', '').split('?')[0];

      let cacheSettings = null;

      if (CACHE_CONFIG[endpoint]) {
        cacheSettings = CACHE_CONFIG[endpoint];
      } else {
        for (const key in CACHE_CONFIG) {
          if (endpoint.startsWith(key)) {
            cacheSettings = CACHE_CONFIG[key];
            break;
          }
        }
      }

      const config = { 
        ...options,
        params, 
        cache: cacheSettings !== false,
        cacheMaxAge: options.maxAge || (cacheSettings?.maxAge || 60000)
      };
      
      return client.get(url, config);
    }, requestKey);
  },

  post: (url, data = {}, options = {}) => {
    return requestManager.enqueue(() => {
      const optimizedData = typeof data === 'object' ? 
        JSON.parse(JSON.stringify(data)) : data;
        
      return client.post(url, optimizedData, options);
    }, null, true);
  },
  
  batchRequests: (requests) => {
    const requestsByDomain = {};
    
    requests.forEach(req => {
      const domain = new URL(req.url, window.location.origin).hostname;
      if (!requestsByDomain[domain]) requestsByDomain[domain] = [];
      requestsByDomain[domain].push(req);
    });
 
    const batchPromises = [];
    
    Object.values(requestsByDomain).forEach(domainRequests => {
      for (let i = 0; i < domainRequests.length; i += 4) {
        const chunk = domainRequests.slice(i, i + 4);
        
        const chunkPromises = chunk.map(({ url, params, method = 'get' }) => {
          return apiService[method.toLowerCase()](url, params);
        });
        
        batchPromises.push(Promise.all(chunkPromises));
      }
    });
    
    return Promise.all(batchPromises).then(results => results.flat());
  }
};

export const prefetchCommonData = (token) => {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  // Создаем набор запросов для выполнения параллельно
  const requests = [
    // Роли пользователей (небольшой статичный список)
    fetch(get_roles_path, { headers }),
    
    // Базовые данные пользователей (первая страница)
    fetch(`${get_user_path}?limit=10`, { headers }),
    
    // Метаданные приложения (если есть)
    // fetch(`/api/metadata`, { headers }),
  ];

  // Выполнить все запросы параллельно
  return Promise.allSettled(requests).then(results => {
    // Сохранить результаты в кэш, если нужно
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.ok) {
        const url = requests[index].url;
        // Можно добавить кэширование данных здесь
        localStorage.setItem(`preloaded_${url}`, Date.now());
      }
    });
    
    return results;
  });
};

export const enableApiMonitoring = () => {
  const originalGet = client.get;
  
  client.get = function(url, config = {}) {
    const startTime = performance.now();
    
    return originalGet(url, config).finally(() => {
      const duration = performance.now() - startTime;

      if (duration > 500) { 
        console.warn(`Медленный запрос: ${url} (${Math.round(duration)}ms)`);
      }
    });
  };
};