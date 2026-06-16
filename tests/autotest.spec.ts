import { test, expect, request } from '@playwright/test';

const BASE_URL = 'https://practice.expandtesting.com/notes/api';
const TEST_NAME = 'QA Tester';

function randomEmail() {
  return `qa_autotest_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@mailinator.com`;
}
function randomPassword() {
  return `Test_${Math.random().toString(36).slice(2, 10)}!`;
}

// Test 1: Регистрация нового пользователя
// Проверяем: POST /users/register возвращает 201 и содержит id и email
test('POST /users/register — успешная регистрация', async () => {
  const context = await request.newContext();
  const email = randomEmail();

  const response = await context.post(`${BASE_URL}/users/register`, {
    data: {
      name: TEST_NAME,
      email,
      password: randomPassword(),
    },
  });

  expect(response.status()).toBe(201);

  const body = await response.json();
  expect(body.success).toBe(true);
  expect(body.data).toHaveProperty('id');
  expect(body.data.email).toBe(email);
});

// Test 2: Регистрация + логин + создание записи резервирования
// Проверяем: токен получен, POST /notes возвращает 200, в ответе есть id, order_id отсутствует (BUG-04)
test('POST /notes — создание записи, order_id отсутствует в ответе (BUG-04)', async () => {
  const context = await request.newContext();
  const email = randomEmail();
  const password = randomPassword();

  // Регистрация собственного пользователя — тест независим от Test 1
  await context.post(`${BASE_URL}/users/register`, {
    data: { name: TEST_NAME, email, password },
  });

  // Логин
  const loginResponse = await context.post(`${BASE_URL}/users/login`, {
    data: { email, password },
  });

  expect(loginResponse.status()).toBe(200);
  const loginBody = await loginResponse.json();
  const token = loginBody.data.token;
  expect(token).toBeTruthy();

  // Создание записи
  const notesResponse = await context.post(`${BASE_URL}/notes`, {
    headers: { 'x-auth-token': token },
    data: {
      title: 'Nike Air Max',
      description: 'qty: 5',
      category: 'Home',
      order_id: '123',
    },
  });

  expect(notesResponse.status()).toBe(200);
  const notesBody = await notesResponse.json();
  expect(notesBody.data).toHaveProperty('id');

  // BUG-04: order_id передан в запросе, но в ответе отсутствует
  expect(notesBody.data).not.toHaveProperty('order_id');
});

// Test 3: Запрос без токена
// Проверяем: GET /notes без x-auth-token возвращает 401
test('GET /notes без токена — 401 Unauthorized', async () => {
  const context = await request.newContext();

  const response = await context.get(`${BASE_URL}/notes`);

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.success).toBe(false);
});
