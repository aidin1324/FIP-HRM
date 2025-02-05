import React from 'react';
import { useNavigate } from 'react-router-dom';

function AfterRegister() {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 text-center">
                {/* Sticker image */}
                <img
                    src="https://i.imgur.com/U3vTGjX.png"
                    alt="Cute sticker"
                    className="mx-auto mb-6 w-24 h-24"
                />
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                    Запрос отправлен!
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Вы успешно отправили запрос на регистрацию.
                    <br />
                    После её одобрения вы сможете войти в систему. Проверяйте почту!
                </p>
                <button
                    onClick={handleLoginClick}
                    className="btn bg-violet-500 hover:bg-violet-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                    Войти в систему
                </button>
            </div>
        </div>
    );
}

export default AfterRegister;