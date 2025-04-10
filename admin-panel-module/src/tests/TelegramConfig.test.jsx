import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import TelegramConfig from "../pages/TelegramConfig";

// Мокируем ThemeContext
jest.mock("../utils/ThemeContext", () => ({
  useThemeProvider: () => ({
    currentTheme: "light",
    isDarkMode: false,
  }),
  // Добавляем ThemeProvider, который просто возвращает своих дочерних элементов
  ThemeProvider: ({ children }) => children,
}));

// Мокируем js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(() => "mock-token"),
}));

// Мокируем fetch API
global.fetch = jest.fn();

describe("TelegramConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Настраиваем успешный ответ для загрузки ID чатов
    global.fetch.mockImplementation((url) => {
      if (
        url.includes("/config_json/config/telegram_chat_ids") &&
        !url.includes("DELETE")
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: "1", chat_id: "123456789" },
            { id: "2", chat_id: "-987654321" },
          ],
        });
      } else if (
        url.includes("/config_json/config/telegram_chat_ids") &&
        url.includes("DELETE")
      ) {
        return Promise.resolve({
          ok: true,
          json: async () => true,
        });
      } else {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: "3", chat_id: "111222333" }),
        });
      }
    });
  });

  // Тестирование функции загрузки списка ID чатов
  test("должен загружать и отображать список ID чатов", async () => {
    await act(async () => {
      render(<TelegramConfig />);
    });

    // Проверяем вызов API
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/config_json/config/telegram_chat_ids"),
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer mock-token",
        }),
      })
    );

    // Проверяем отображение загруженных ID чатов
    await waitFor(() => {
      expect(screen.getByText("123456789")).toBeInTheDocument();
      expect(screen.getByText("-987654321")).toBeInTheDocument();
    });
  });

  // Тестирование валидации ввода
  test("должен показывать ошибку при вводе невалидного ID чата", async () => {
    await act(async () => {
      render(<TelegramConfig />);
    });

    // Находим поле ввода и вводим невалидное значение
    const input = screen.getByPlaceholderText("Например: 123456789");
    fireEvent.change(input, { target: { value: "не_число" } });

    // Нажимаем кнопку "Добавить"
    const submitButton = screen.getByText("Добавить");
    fireEvent.click(submitButton);

    // Проверяем, что отображается сообщение об ошибке
    await waitFor(() => {
      expect(
        screen.getByText("ID чата должен быть числом")
      ).toBeInTheDocument();
    });

    // Проверяем, что fetch не был вызван для добавления
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining("/config_json/config/telegram_chat_ids"),
      expect.objectContaining({ method: "POST" })
    );
  });

  // Тестирование добавления нового ID чата
  test("должен успешно добавлять новый ID чата", async () => {
    await act(async () => {
      render(<TelegramConfig />);
    });

    // Сбрасываем моки перед тестом добавления
    global.fetch.mockClear();

    // Находим поле ввода и вводим валидное значение
    const input = screen.getByPlaceholderText("Например: 123456789");
    fireEvent.change(input, { target: { value: "111222333" } });

    // Нажимаем кнопку "Добавить"
    const submitButton = screen.getByText("Добавить");
    fireEvent.click(submitButton);

    // Проверяем, что fetch был вызван с правильными параметрами
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/config_json/config/telegram_chat_ids"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ chat_id: "111222333" }),
        })
      );
    });

    // Проверяем, что поле ввода очищено после успешного добавления
    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  // Тестирование модального окна удаления
  test("должен открывать модальное окно при нажатии на кнопку удаления", async () => {
    await act(async () => {
      render(<TelegramConfig />);
    });

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText("123456789")).toBeInTheDocument();
    });

    // Нажимаем на кнопку удаления у первого элемента
    const deleteButtons = document.querySelectorAll(
      'button[class*="text-red-500"]'
    );
    fireEvent.click(deleteButtons[0]);

    // Проверяем, что модальное окно отображается с правильной информацией
    await waitFor(() => {
      // Проверяем заголовок модального окна
      expect(screen.getByText("Подтверждение удаления")).toBeInTheDocument();

      // Проверяем текст подтверждения (используем регулярное выражение)
      expect(
        screen.getByText(/Вы действительно хотите удалить ID чата/)
      ).toBeInTheDocument();

      // Используем getAllByText и проверяем второе появление текста "123456789" (в модальном окне)
      const chatIdElements = screen.getAllByText("123456789");
      expect(chatIdElements.length).toBeGreaterThan(1); // Должно быть как минимум 2 элемента

      // Или используем функцию поиска по атрибутам родительского элемента
      const modalChatId = screen.getByText((content, element) => {
        return (
          content === "123456789" && element.closest('[role="dialog"]') !== null
        );
      });
      expect(modalChatId).toBeInTheDocument();
    });
  });

  // Тестирование удаления ID чата
  test("должен удалять ID чата при подтверждении", async () => {
    await act(async () => {
      render(<TelegramConfig />);
    });

    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText("123456789")).toBeInTheDocument();
    });

    // Сбрасываем моки перед тестом удаления
    global.fetch.mockClear();

    // Нажимаем на кнопку удаления у первого элемента
    const deleteButtons = document.querySelectorAll(
      'button[class*="text-red-500"]'
    );
    fireEvent.click(deleteButtons[0]);

    // Ждем открытия модального окна
    await waitFor(() => {
      expect(screen.getByText("Подтверждение удаления")).toBeInTheDocument();
    });

    // Нажимаем кнопку "Удалить" в модальном окне
    const confirmDeleteButton = screen.getByText("Удалить");
    fireEvent.click(confirmDeleteButton);

    // Проверяем, что fetch был вызван с правильными параметрами
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/config_json/config/telegram_chat_ids/1"),
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});
