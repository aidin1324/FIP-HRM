import React from 'react';

const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Загрузка...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;