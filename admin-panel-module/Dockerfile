# Этап сборки
FROM node:18-alpine as build

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование исходного кода
COPY . .

# Установка переменной окружения для production
# RUN echo "VITE_API_BASE_URL=http://backend:8000" > .env.production

# Сборка проекта
RUN npm run build

# Этап production
FROM nginx:alpine

# Копирование собранных файлов из этапа сборки
COPY --from=build /app/dist /usr/share/nginx/html

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]