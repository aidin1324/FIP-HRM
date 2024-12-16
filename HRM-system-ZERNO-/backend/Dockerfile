# Используем официальный образ Python
FROM python:3.12-slim

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Устанавливаем зависимости для сборки и runtime
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем poetry
RUN pip install poetry

# Копируем файлы poetry в контейнер
COPY pyproject.toml poetry.lock* /app/

# Конфигурируем poetry для установки зависимостей без создания виртуального окружения
RUN poetry config virtualenvs.create false

# Устанавливаем зависимости
RUN poetry install --no-interaction --no-ansi

# Копируем остальные файлы проекта
COPY . .

# Указываем, что контейнер будет слушать порт 8000
EXPOSE 8000

# Выполняем миграции и запускаем приложение через Poetry
CMD ["bash", "-c", "cd app && poetry run alembic upgrade head && poetry run uvicorn main:app --host 0.0.0.0 --port 8000"]
