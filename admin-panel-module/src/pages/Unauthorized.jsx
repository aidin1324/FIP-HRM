import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="p-1 bg-gradient-to-r from-violet-500 to-purple-600"></div>
        
        <div className="px-6 py-8 md:px-10 md:py-12">
          {/* Минималистичная иконка */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <svg className="w-10 h-10 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4m0 0v2m0-2h2M8 9h4m-4 0H8"></path>
              </svg>
            </div>
          </div>
          
          {/* Заголовок и текст */}
          <h1 className="text-2xl md:text-3xl font-medium text-center text-gray-800 dark:text-gray-100 mb-2">
            Доступ ограничен
          </h1>
          
          <div className="w-12 h-1 bg-violet-500 mx-auto mb-6 rounded-full"></div>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-8 max-w-md mx-auto leading-relaxed">
            У вас нет необходимых прав для просмотра этой страницы. Пожалуйста, свяжитесь с администратором, если вам требуется доступ.
          </p>
          
          {/* Действия */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/" 
              className="w-full sm:w-auto px-6 py-3 bg-violet-500 text-white text-center rounded-lg hover:bg-violet-600 transition-colors duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-opacity-50"
            >
              Вернуться на главную
            </Link>
            
            <Link 
              to="/dashboard" 
              className="w-full sm:w-auto px-6 py-3 bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-center rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-300 font-medium"
            >
              Перейти в дашборд
            </Link>
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Код ошибки: <span className="font-mono">403 Forbidden</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;