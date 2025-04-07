import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "../css/style.css";
import { AuthContext } from "../contexts/AuthContext";
import { auth_login_path } from "../api_endpoints";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [blockTime, setBlockTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (blockTime && new Date() < blockTime) {
      const secondsLeft = Math.ceil((blockTime - new Date()) / 1000);
      setError(`Слишком много попыток. Повторите через ${secondsLeft} секунд`);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(auth_login_path, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });
      const data = await response.json();
  
      if (response.ok) {
        login(data.access_token);
        setIsPreloading(true);
        
        try {
          await Promise.allSettled([
            fetch(get_roles_path).then(res => {
              if (res.ok) return res.json();
              return Promise.reject('Failed to fetch roles');
            }),
            fetch(get_user_path + '?limit=10').then(res => {
              if (res.ok) return res.json();
              return Promise.reject('Failed to fetch users');
            })
          ]);
        } catch (preloadErr) {
          console.warn('Предварительная загрузка данных: ', preloadErr);
        } finally {
          navigate("/dashboard");
          setLoginAttempts(0);
        }
      } else {
        setError(data.message || "Неправильный email или пароль");
      }
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        const blockUntil = new Date(new Date().getTime() + 30000); 
        setBlockTime(blockUntil);
        setError('Слишком много неудачных попыток. Пожалуйста, подождите 30 секунд.');
      } else {
        setError('Неверные учетные данные.');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.error("Ошибка авторизации");
      }
    } finally {
      setLoading(false);
      setIsPreloading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 shadow-md rounded-xl">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 text-center">
          Войти в ZernoHub
        </h2>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg"
              role="alert"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
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

          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type={showPass ? "text" : "password"}
              required
              className="form-input w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-violet-200 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-sm text-gray-500 dark:text-gray-400"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? "Скрыть" : "Показать"}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                Запомнить меня
              </span>
            </label>
            <div className="text-sm">
              <a
                href="/forgot-password"
                className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
              >
                Забыли пароль?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isPreloading}
              className="btn w-full flex justify-center bg-violet-500 hover:bg-violet-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-200"
            >
              {loading ? "Вход..." : isPreloading ? "Загрузка данных..." : "Войти"}
            </button>
          </div>

          <div className="text-sm text-center">
            Нет учетной записи?{" "}
            <a
              href="/register"
              className="font-medium text-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
            >
              Зарегистрироваться
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
