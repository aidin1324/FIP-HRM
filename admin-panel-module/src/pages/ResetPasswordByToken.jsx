import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { reset_password_path } from '../api_endpoints';

function ResetPasswordByToken() {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get('token');
    
    if (!resetToken) {
      setError('Токен сброса пароля не найден. Пожалуйста, проверьте ссылку.');
    } else {
      setToken(resetToken);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Валидация паролей
    if (newPassword.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    setLoading(true);
    try {
      // Отправка запроса в формате, который ожидает бэкенд
      const response = await axios.post(reset_password_path, {
        token: token,          // Токен из URL
        new_password: newPassword // Новый пароль, введенный пользователем
      });
      
      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                         'Произошла ошибка при сбросе пароля.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-xl p-8">
          <div className="text-center">
            <div className="mx-auto mb-6 w-24 h-24 flex items-center justify-center bg-green-100 dark:bg-green-900/30 rounded-full">
              <svg className="w-16 h-16 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Пароль успешно изменён!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Ваш пароль был успешно обновлен. Теперь вы можете войти в систему, используя новый пароль.
            </p>
            <button
              onClick={handleLoginClick}
              className="btn bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              Войти в систему
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6">
          Создание нового пароля
        </h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Введите новый пароль для вашей учетной записи в системе ZernoHub.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Новый пароль
            </label>
            <input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              required
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-violet-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-sm text-gray-500 dark:text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Скрыть" : "Показать"}
            </button>
            {newPassword && newPassword.length < 8 && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Пароль должен содержать минимум 8 символов
              </p>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Подтверждение пароля
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              className="form-input w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-violet-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Пароли не совпадают
              </p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn w-full flex justify-center bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Сохранение...
              </div>
            ) : (
              "Сохранить новый пароль"
            )}
          </button>
        </form>
        
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 dark:text-yellow-200">
                Надежный пароль должен содержать минимум 8 символов, включая буквы, цифры и специальные символы.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordByToken;