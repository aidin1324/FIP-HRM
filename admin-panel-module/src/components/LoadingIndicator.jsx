import React from 'react';

const LoadingIndicator = ({ message = "Загрузка данных..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600 dark:text-gray-300">{message}</p>
    </div>
  );
};

export default LoadingIndicator;