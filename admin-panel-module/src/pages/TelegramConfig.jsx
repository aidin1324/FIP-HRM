import React, { useState, useEffect } from "react";
import { useThemeProvider } from "../utils/ThemeContext";
import Cookies from 'js-cookie'; 

const TELEGRAM_CONFIG_PATH = "/config_json/config/telegram_chat_ids";
const apiBaseUrl = "http://165.22.213.129:8000";

const makeApiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    console.log('Токен авторизации:', Cookies.get('access_token') ? 'Существует' : 'Отсутствует');
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('access_token')}`
      },
      body: data ? JSON.stringify(data) : undefined
    };
    
    console.log('Используемый API URL:', apiBaseUrl + endpoint);
    const response = await fetch(`${apiBaseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`Ошибка запроса: ${response.status}`);
    }
    
    return method === 'DELETE' ? true : await response.json();
  } catch (error) {
    throw error;
  }
};

const TelegramConfig = () => {
  const { currentTheme } = useThemeProvider();
  const isDarkMode = currentTheme === "dark";

  const [chatIds, setChatIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [newChatId, setNewChatId] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    chatId: null,
    id: null,
    loading: false,
  });

  const fetchChatIds = async () => {
    setLoading(true);
    try {
      const data = await makeApiRequest(TELEGRAM_CONFIG_PATH);
      setChatIds(data);
    } catch (error) {
      console.error("Error fetching chat IDs:", error);
      showNotification("Не удалось загрузить ID чатов", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  useEffect(() => {
    fetchChatIds();
  }, []);

  const validateChatId = (value) => {
    if (!value) return "ID чата обязателен";
    if (!/^-?\d+$/.test(value)) return "ID чата должен быть числом";
    return "";
  };

  const handleAddChatId = async (e) => {
    e.preventDefault();

    const error = validateChatId(newChatId);
    if (error) {
      setValidationErrors({ chatId: error });
      return;
    }

    try {
      setLoading(true);
      await makeApiRequest(TELEGRAM_CONFIG_PATH, 'POST', { chat_id: newChatId });
      showNotification("ID чата успешно добавлен");
      setNewChatId("");
      setValidationErrors({});
      await fetchChatIds();
    } catch (error) {
      console.error("Error adding chat ID:", error);
      showNotification("Не удалось добавить ID чата", "error");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id, chatId) => {
    setDeleteModal({
      isOpen: true,
      id: id,
      chatId: chatId,
      loading: false,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      id: null,
      chatId: null,
      loading: false,
    });
  };

  const handleDeleteChatId = async () => {
    if (!deleteModal.id) return;

    try {
      setDeleteModal((prev) => ({ ...prev, loading: true }));
      await makeApiRequest(`${TELEGRAM_CONFIG_PATH}/${deleteModal.id}`, 'DELETE');
      showNotification("ID чата успешно удален");
      closeDeleteModal();
      await fetchChatIds();
    } catch (error) {
      console.error("Error deleting chat ID:", error);
      showNotification("Не удалось удалить ID чата", "error");
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-5xl mx-auto">
            {/* Заголовок страницы */}
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 m-0">
                  Настройка Telegram для обратной связи
                </h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                Настройте ID чатов Telegram, куда будут отправляться уведомления с
                отзывами пользователей
              </p>
            </div>

            {/* Уведомления */}
            {notification.show && (
              <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full">
                <div
                  className={`mx-4 rounded-lg shadow-lg border p-4 ${
                    notification.type === "success"
                      ? "bg-white dark:bg-gray-800 border-violet-200 dark:border-violet-800"
                      : notification.type === "error"
                      ? "bg-white dark:bg-gray-800 border-red-200 dark:border-red-800"
                      : "bg-white dark:bg-gray-800 border-yellow-200 dark:border-yellow-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {notification.type === "success" && (
                        <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-violet-600 dark:text-violet-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      {notification.type === "error" && (
                        <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </div>
                      )}
                      {notification.type === "warning" && (
                        <div className="mr-3 flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                      )}
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        {notification.message}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotification((prev) => ({ ...prev, show: false }))
                      }
                      className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Форма добавления */}
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-shadow duration-300 p-5">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-4">
                Добавить новый ID чата
              </h3>

              <form onSubmit={handleAddChatId} className="max-w-md">
                <div>
                  <label
                    htmlFor="chatId"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    ID чата Telegram <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="chatId"
                      placeholder="Например: 123456789"
                      className={`form-input pl-10 w-full rounded-md ${
                        validationErrors.chatId
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
                      value={newChatId}
                      onChange={(e) => setNewChatId(e.target.value)}
                    />
                  </div>
                  {validationErrors.chatId && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationErrors.chatId}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ID чата можно получить через бота{" "}
                    <a
                      href="https://t.me/UserInfoToBot"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      @UserInfoToBot
                    </a>{" "}
                    или{" "}
                    <a
                      href="https://t.me/UserX_RoBot"
                      target="_blank"
                      rel="noopener noreferrer" 
                      className="text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      @UserX_RoBot
                    </a>
                  </p>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-md flex items-center justify-center transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        ></path>
                      </svg>
                    )}
                    Добавить
                  </button>
                </div>
              </form>
            </div>

            {/* Таблица с существующими чатами */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow transition-shadow duration-300 mb-6">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                  Список ID чатов
                </h3>
              </div>

              {loading && chatIds.length === 0 ? (
                <div className="p-10 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
                </div>
              ) : chatIds.length === 0 ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="h-12 w-12 mx-auto mb-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <p className="text-lg">Нет добавленных чатов</p>
                  <p className="text-sm mt-1">
                    Добавьте ID чата, чтобы начать получать уведомления
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          ID чата
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {chatIds.map((record) => (
                        <tr key={record.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-mono text-lg font-medium text-violet-600 dark:text-violet-400 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2 text-violet-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {record.chat_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() =>
                                openDeleteModal(record.id, record.chat_id)
                              }
                              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Информационный блок */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <svg
                  className="h-5 w-5 text-violet-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="m-0 font-medium">Как получить ID чата в Telegram:</p>
                  <ol className="list-decimal ml-5 mt-1 space-y-1">
                    <li>
                      Начните диалог с ботом{" "}
                      <a
                        href="https://t.me/UserInfoToBot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                      >
                        @UserInfoToBot
                      </a>{" "}
                      или{" "}
                      <a
                        href="https://t.me/UserX_RoBot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-500 hover:text-violet-600 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
                      >
                        @UserX_RoBot
                      </a>
                    </li>
                    <li>Бот вернет ваш личный ID или ID чата</li>
                    <li>
                      Для групповых чатов, добавьте бота в группу для получения ID
                      группы
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Увеличиваем отступ внизу страницы для лучшей прокрутки */}
            <div className="h-36"></div>
          </div>
        </main>
      </div>
      
      {/* Модальное окно подтверждения удаления остается без изменений */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-labelledby="modal-title"
          role="dialog"
        >
          {/* Улучшенный фон с размытием */}
          <div className="fixed inset-0 backdrop-blur-sm bg-black/40 dark:bg-black/60 transition-opacity" aria-hidden="true"></div>
          
          {/* Контейнер модального окна */}
          <div className="relative w-full max-w-md p-6 mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                  Подтверждение удаления
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Вы действительно хотите удалить ID чата{" "}
                    <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                      {deleteModal.chatId}
                    </span>
                    ?
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Это действие нельзя отменить.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                onClick={closeDeleteModal}
              >
                Отмена
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none flex items-center justify-center"
                onClick={handleDeleteChatId}
                disabled={deleteModal.loading}
              >
                {deleteModal.loading ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Удалить"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelegramConfig;
