# qa-autotest-notes-api

Автотесты для Notes API (https://practice.expandtesting.com/notes/api) на Playwright + TypeScript.

## Что покрыто

| Тест | Описание |
|------|----------|
| `POST /users/register` | Успешная регистрация — 201, наличие id и email в ответе |
| `POST /notes` | Создание записи — 200, наличие id; фиксирует отсутствие `order_id` в ответе (BUG-04) |
| `GET /notes` | Запрос без токена — 401 Unauthorized |

## Запуск

```bash
npm install
npx playwright install chromium
npx playwright test
```

## Отчёт

```bash
npm run report
```
