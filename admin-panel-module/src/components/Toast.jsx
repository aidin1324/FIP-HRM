import React, { useEffect, useState } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onClose && onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div 
      className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full ${
        visible ? 'animate-fade-in' : 'animate-fade-out'
      }`}
    >
      <div 
        className={`mx-4 rounded-lg shadow-lg border ${
          type === 'success' 
            ? 'bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-800' 
            : type === 'error'
              ? 'bg-white dark:bg-gray-800 border-red-200 dark:border-red-800'
              : 'bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-800'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            {type === 'success' && (
              <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {type === 'error' && (
              <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            {type === 'warning' && (
              <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {message}
            </p>
          </div>
          <button 
            onClick={() => {
              setVisible(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;