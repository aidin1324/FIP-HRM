import React from 'react';

const Loading = () => (
  <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
    <div className="flex space-x-3">
      <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce"></div>
      <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce animation-delay-200"></div>
      <div className="w-3 h-3 bg-violet-500 rounded-full animate-bounce animation-delay-400"></div>
    </div>
  </div>
);

export default Loading;
