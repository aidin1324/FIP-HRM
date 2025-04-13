FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm install esbuild@0.24.0 --save-dev 

RUN npm i -g serve

COPY . .

# Копируем Docker-специфичный .env файл
COPY .env.docker .env

RUN npm run build

EXPOSE 3000

CMD [ "serve", "-s", "dist" ]