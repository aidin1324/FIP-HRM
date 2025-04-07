import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { forgot_password_path } from '../api_endpoints';

function ResetPassword() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Отправка запроса на сервер в соответствии с API 
      await axios.post(forgot_password_path, { 
        email 
      });
      
      // Бэкенд всегда возвращает успешный ответ для безопасности
      setSuccess(true);
    } catch (err) {
      // В случае ошибок сервера показываем сообщение
      if (err.response && err.response.status !== 404) {
        setError(err.response?.data?.detail || 'Произошла ошибка при отправке запроса');
      } else {
        // Для безопасности показываем, что письмо отправлено, даже если email не найден
        setSuccess(true);
      }
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
              Проверьте почту!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Если указанный адрес электронной почты зарегистрирован в системе, вы получите инструкцию по сбросу пароля.
            </p>
            <button
              onClick={handleLoginClick}
              className="btn bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              Вернуться ко входу
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
          Восстановление пароля
        </h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Введите адрес электронной почты, связанный с вашей учетной записью, и мы отправим вам ссылку для сброса пароля.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Электронный адрес
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-violet-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn w-full flex justify-center bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Отправка...
              </div>
            ) : "Отправить инструкции"}
          </button>
        </form>
        <div className="text-sm text-center mt-6">
          <a
            href="/login"
            className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
          >
            Вернуться к странице входа
          </a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;