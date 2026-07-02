import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import open from 'open';
import { test, apiUrl, TodoBuilder } from '../src/helpers';

let token;
let resultUrl;

test.afterAll(async () => {
  await open(resultUrl);
});

test('Получить токен', { tag: '@post' }, async ({ api }) => {
  const { status, headers } = await api.challenger.post();

  expect(status).toBe(201);
  expect(headers).toHaveProperty('x-challenger');
  expect(headers).toHaveProperty('location');

  token = headers['x-challenger'];
  resultUrl = `${apiUrl}${headers.location}`;
});

test('Получить список челленджей', { tag: '@get' }, async ({ api }) => {
  const { status, body } = await api.challenges.get(token);

  expect(status).toBe(200);
  expect(body.challenges).toHaveLength(59);

  for (const challenge of body.challenges) {
    expect(Object.keys(challenge).sort()).toEqual(['description', 'id', 'name', 'status']);

    expect(challenge).toEqual({
      id: expect.any(Number),
      name: expect.any(String),
      description: expect.any(String),
      status: expect.any(Boolean),
    });
  }
});

test.describe('Получить список задач', () => {
  test('без параметров', { tag: '@get' }, async ({ api }) => {
    const { status, body } = await api.todos.get({ token });

    expect(status).toBe(200);
    expect(body.todos).toHaveLength(10);

    for (const todo of body.todos) {
      expect(Object.keys(todo).sort()).toEqual(['description', 'doneStatus', 'id', 'title']);

      expect(todo).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        doneStatus: expect.any(Boolean),
        description: expect.any(String),
      });
    }
  });

  test('в формате XML', { tag: '@get' }, async ({ api }) => {
    const requestHeaders = {
      Accept: 'application/xml',
    };

    const { status, headers, body } = await api.todos.get({ token, requestHeaders });

    expect(status).toBe(200);
    expect(headers['content-type']).toContain('application/xml');
    expect(body).toContain('<todos>');
    expect(body).toContain('<todo>');
    expect(body).toContain('<id>');
    expect(body).toContain('<title>');
    expect(body).toContain('<doneStatus>');
    expect(body).toContain('<description');
  });

  test('в формате JSON', { tag: '@get' }, async ({ api }) => {
    const requestHeaders = {
      Accept: 'application/json',
    };

    const { status, headers, body } = await api.todos.get({ token, requestHeaders });

    expect(status).toBe(200);
    expect(headers['content-type']).toContain('application/json');
    expect(body.todos).toHaveLength(10);

    for (const todo of body.todos) {
      expect(Object.keys(todo).sort()).toEqual(['description', 'doneStatus', 'id', 'title']);

      expect(todo).toEqual({
        id: expect.any(Number),
        title: expect.any(String),
        doneStatus: expect.any(Boolean),
        description: expect.any(String),
      });
    }
  });
});

test.describe('Попытаться получить список задач', () => {
  test('обращаясь к неверному эндпоинту', { tag: '@get' }, async ({ api }) => {
    const { status, statusText } = await api.todo.get(token);

    expect(status).toBe(404);
    expect(statusText).toBe('Not Found');
  });

  test('в неподдерживаемом формате', { tag: '@get' }, async ({ api }) => {
    const requestHeaders = {
      Accept: 'application/gzip',
    };

    const { status, body } = await api.todos.get({ token, requestHeaders });

    expect(status).toBe(406);
    expect(body.errorMessages[0]).toBe('Unrecognised Accept Type');
  });
});

test.describe('Работа с задачей', () => {
  const createdTodo = new TodoBuilder().withTitle().withDoneStatus(false).withDescription().build();

  test('Создать задачу', { tag: '@post' }, async ({ api }) => {
    const { status, body } = await api.todos.post({ token, data: createdTodo });

    createdTodo.id = body.id;

    expect(status).toBe(201);
    expect(body.id).toEqual(expect.any(Number));

    for (const key of Object.keys(createdTodo)) {
      expect(body[key]).toBe(createdTodo[key]);
    }
  });

  test('Получить созданную задачу', { tag: '@get' }, async ({ api }) => {
    const { status, body } = await api.todos.getById({ token, id: createdTodo.id });

    expect(status).toBe(200);
    expect(body).toHaveProperty('todos');
    expect(body.todos).toHaveLength(1);

    const receivedTodo = body.todos[0];

    expect(receivedTodo).toEqual(createdTodo);
  });

  test('Завершить созданную задачу', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withDoneStatus(true).build();

    const { status, body } = await api.todos.postById({
      token,
      id: createdTodo.id,
      data,
    });

    expect(status).toBe(200);
    expect(body.doneStatus).toBe(true);
  });

  test('Получить список завершенных задач', { tag: '@get' }, async ({ api }) => {
    const urlParams = new TodoBuilder().withDoneStatus(true).build();

    const { status, body } = await api.todos.get({ token, urlParams });

    expect(status).toBe(200);

    for (const todo of body.todos) {
      expect(todo.doneStatus).toBe(true);
    }
  });

  test('Отредактировать все поля созданной задачи', { tag: '@put' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription().build();

    const { status, body } = await api.todos.putById({ token, id: createdTodo.id, data });

    expect(status).toBe(200);
    expect(body.id).toEqual(createdTodo.id);

    for (const key of Object.keys(data)) {
      expect(body[key]).toBe(data[key]);
    }
  });

  test('Отредактировать одно поле созданной задачи', { tag: '@put' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle().build();

    const { status, body } = await api.todos.putById({ token, id: createdTodo.id, data });

    expect(status).toBe(200);
    expect(body.id).toEqual(createdTodo.id);
    expect(body.title).toEqual(data.title);
  });

  test('Удалить созданную задачу', { tag: '@delete' }, async ({ api }) => {
    const { status } = await api.todos.delete({ token, id: createdTodo.id });

    expect(status).toBe(200);
  });

  test('Попытаться получить удаленную задачу', { tag: '@get' }, async ({ api }) => {
    const { status, statusText, body } = await api.todos.getById({ token, id: createdTodo.id });

    expect(status).toBe(404);
    expect(statusText).toBe('Not Found');
    expect(body.errorMessages[0]).toBe(`Could not find an instance with todos/${createdTodo.id}`);
  });

  test('Попытаться отредактировать удаленную задачу', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle().build();

    const { status, body } = await api.todos.postById({
      token,
      id: createdTodo.id,
      data,
    });

    expect(status).toBe(404);
    expect(body.errorMessages[0]).toBe(`No such todo entity instance with id == ${createdTodo.id} found`);
  });
});

test.describe('Создать задачу', () => {
  test('с заголовком длиной 50 символов и описанием длиной 200 символов', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle({ length: 50 }).withDoneStatus().withDescription({ length: 200 }).build();

    const { status, body } = await api.todos.post({ token, data });

    expect(status).toBe(201);
    expect(body.id).toEqual(expect.any(Number));

    for (const key of Object.keys(data)) {
      expect(body[key]).toBe(data[key]);
    }
  });

  test('в формате JSON и получить ответ в формате XML', { tag: '@post' }, async ({ api }) => {
    const requestHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/xml',
    };
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription().build();

    const { status, headers, body } = await api.todos.post({ token, requestHeaders, data });

    expect(status).toBe(201);
    expect(headers['content-type']).toContain('application/xml');
    expect(body).toContain('<todo>');
    expect(body).toContain('<id>');
    expect(body).toContain('<title>');
    expect(body).toContain(data.title);
    expect(body).toContain('<doneStatus>');
    expect(body).toContain(data.doneStatus.toString());
    expect(body).toContain('<description');
    expect(body).toContain(data.description);
  });

  test('в формате JSON и получить ответ в формате JSON', { tag: '@post' }, async ({ api }) => {
    const requestHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription().build();

    const { status, headers, body } = await api.todos.post({ token, requestHeaders, data });

    expect(status).toBe(201);
    expect(headers['content-type']).toContain('application/json');
    expect(body.id).toEqual(expect.any(Number));

    for (const key of Object.keys(data)) {
      expect(body[key]).toBe(data[key]);
    }
  });
});

test.describe('Попытаться создать задачу', () => {
  test('вызывая неверный HTTP-метод', { tag: '@put' }, async ({ api }) => {
    const id = faker.number.int({ min: 11, max: 100 });
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription().build();

    const { status, statusText } = await api.todos.putById({ token, id, data });

    expect(status).toBe(400);
    expect(statusText).toBe('Bad Request');
  });

  test('с неверным статусом', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle().withDoneStatus('done').withDescription().build();

    const { status, body } = await api.todos.post({ token, data });

    expect(status).toBe(400);
    expect(body.errorMessages[0]).toBe('Failed Validation: doneStatus should be BOOLEAN but was STRING');
  });

  test('с заголовком, превышающим 50 символов', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle({ length: 51 }).withDoneStatus().withDescription().build();

    const { status, body } = await api.todos.post({ token, data });

    expect(status).toBe(400);
    expect(body.errorMessages[0]).toBe('Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50');
  });

  test('с описанием, превышающим 200 символов', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription({ length: 201 }).build();

    const { status, body } = await api.todos.post({ token, data });

    expect(status).toBe(400);
    expect(body.errorMessages[0]).toBe('Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200');
  });

  test('с телом запроса, превышающим 5000 символов', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription({ length: 5000 }).build();

    const { status, body } = await api.todos.post({ token, data });

    expect(status).toBe(413);
    expect(body.errorMessages[0]).toBe('Error: Request body too large, max allowed is 5000 bytes');
  });

  test('с несуществующим полем deadline', { tag: '@post' }, async ({ api }) => {
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription().withDeadline().build();

    const { status, body } = await api.todos.post({ token, data });

    expect(status).toBe(400);
    expect(body.errorMessages[0]).toBe('Could not find field: deadline');
  });

  test('в неподдерживаемом формате', { tag: '@post' }, async ({ api }) => {
    const requestHeaders = {
      'Content-Type': 'marus',
    };
    const data = new TodoBuilder().withTitle().withDoneStatus().withDescription().build();

    const { status, body } = await api.todos.post({ token, requestHeaders, data });

    expect(status).toBe(415);
    expect(body.errorMessages[0]).toBe('Unsupported Content Type - marus');
  });
});

test('Удалить все задачи', { tag: '@delete' }, async ({ api }) => {
  let body;

  ({ body } = await api.todos.get({ token }));

  const ids = body.todos.map(({ id }) => id);

  for (const id of ids) {
    const { status } = await api.todos.delete({ token, id });
    expect(status).toBe(200);
  }

  ({ body } = await api.todos.get({ token }));

  expect(body.todos).toHaveLength(0);
});

test.describe('Проверка доступности сервера', () => {
  test('Сервер доступен', { tag: '@get' }, async ({ api }) => {
    const { status, statusText } = await api.heartbeat.get(token);

    expect(status).toBe(204);
    expect(statusText).toBe('No Content');
  });

  test('При внутренней ошибке возвращается статус 500', { tag: '@patch' }, async ({ api }) => {
    const { status, statusText } = await api.heartbeat.patch(token);

    expect(status).toBe(500);
    expect(statusText).toBe('Internal Server Error');
  });

  test('При неподдерживаемом HTTP-методе возвращается статус 405', { tag: '@delete' }, async ({ api }) => {
    const { status, statusText } = await api.heartbeat.delete(token);

    expect(status).toBe(405);
    expect(statusText).toBe('Method Not Allowed');
  });
});
