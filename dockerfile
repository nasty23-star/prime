# Dockerfile
# Стадия сборки
FROM node:20-alpine as build-stage

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Стадия production
FROM nginx:alpine as production-stage

# Копируем собранное приложение в nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
