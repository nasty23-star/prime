# prime

# Тестовое задание
Разработать интерфейс для сайта Hacker News, состоящий из двух страниц.

## Продуктовые требования

### Главная страница
Показывает последние 100 новостей в виде списка, отсортированного по дате, самые свежие сверху.

Каждая новость содержит: название, рейтинг, ник, автора, дату публикации.

По клику на новость происходит переход на страницу новости.

Список новостей должен автоматически обновляться раз в минуту без участия пользователя.

На странице должна быть кнопка для принудительного обновления списка новостей.

### Страница новости

должна содержать: ссылку на новость, заголовок новости, дату, автора, счётчик количества комментариев, список комментариев в виде дерева.

Корневые комментарии подгружаются сразу же при входе на страницу, вложенные - по клику на корневой.

На странице должна быть кнопка для принудительного обновления списка комментариев. На странице должна быть кнопка для возврата к списку новостей.

## Технические требования

Приложение разработано с использованием стейт-менеджера.

Использован официальный `API Hacker News. Вызовы Hacker News API`, обработка данных от него производятся напрямую с фронтенда.

Роутинг выполнен с использованием роутера.

Фреймворк UI любой на ваше усмотрение.

Можно и на чистом css, главное, чтобы было красиво.

Приложение должно запускаться по адресу localhost:3000

При переходах по ссылкам страница не перезагружается.

Исходный код решения должен быть выложен с вашего аккаунта на `Github`.

### Опциональные задания

Использование TypeScript, покрытие кода юнит-тестами.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
