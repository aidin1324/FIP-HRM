import React, { useEffect } from 'react';

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className={`rounded-xl px-5 py-4 shadow-lg backdrop-blur-md ${
        type === 'success' 
          ? 'bg-green-500/90 dark:bg-green-600/90 text-white' 
          : 'bg-red-500/90 dark:bg-red-600/90 text-white'
      }`}>
        <div className="flex items-center space-x-3">
          {type === 'success' ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Toast;