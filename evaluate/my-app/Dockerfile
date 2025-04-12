FROM node:18-alpine

WORKDIR /app

COPY package*.json .

COPY . .

RUN npm install

RUN npm install esbuild@0.24.0 --save-dev

RUN [ "npm", "run", "build" ]

RUN [ "npm", "install", "-g", "serve" ]

EXPOSE 5000

CMD [ "serve", "-s", "build", "-l", "5000" ]
