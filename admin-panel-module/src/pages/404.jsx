import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function PageNotFound() {
  const location = useLocation();
  const [path, setPath] = useState('');
  
  useEffect(() => {
    setPath(location.pathname);
  }, [location]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-8xl font-bold text-gray-900 dark:text-gray-100">
            404
          </h1>
          <h2 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mt-4">
            Страница не найдена
          </h2>
        </div>

        <div className="mb-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Запрошенная страница не существует или была перемещена.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="block w-full py-3 px-4 text-center bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    </div>
  );
}

export default PageNotFound;