import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { test, TodoBuilder } from '../src/helpers';


test.describe('API тесты', () => {
  let token;

  test('Получить токен', { tag: '@post' }, async ({ api }) => {
    const { status, headers } = await api.challenger.post();

    token = headers['x-challenger'];

    expect(status).toBe(201);
    expect(headers).toHaveProperty('x-challenger');
    expect(headers).toHaveProperty('location');
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

  test('Получить список задач', { tag: '@get' }, async ({ api }) => {
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

  test('Попытаться получить список задач, обращаясь к неверному эндпоинту', { tag: '@get' }, async ({ api }) => {
    const { status, statusText } = await api.todo.get(token);

    expect(status).toBe(404);
    expect(statusText).toBe('Not Found');
  });

  test.describe('Работа с задачей', () => {
    const newTodo = new TodoBuilder().withTitle().withDoneStatus(false).withDescription().build();

    test('Попытаться создать задачу, вызывая неверный HTTP-метод', { tag: '@put' }, async ({ api }) => {
      const id = faker.number.int({ min: 11, max: 100 });

      const { status, statusText } = await api.todos.putById({ token, id, data: newTodo });

      expect(status).toBe(400);
      expect(statusText).toBe('Bad Request');
    });
    
    test('Создать задачу', { tag: '@post' }, async ({ api }) => {
      const { status, body } = await api.todos.post({ token, data: newTodo });

      newTodo.id = body.id;

      expect(status).toBe(201);
      expect(body.id).toEqual(expect.any(Number));

      for (const key of Object.keys(newTodo)) {
        expect(body[key]).toBe(newTodo[key]);
      }
    });

    test('Получить созданную задачу', { tag: '@get' }, async ({ api }) => {
      const { status, body } = await api.todos.getById({ token, id: newTodo.id });

      expect(status).toBe(200);
      expect(body).toHaveProperty('todos');
      expect(body.todos).toHaveLength(1);

      const receivedTodo = body.todos[0];

      expect(receivedTodo).toEqual(newTodo);
    });

    test('Завершить созданную задачу', { tag: '@post' }, async ({ api }) => {
      const { status, body } = await api.todos.postById({
        token,
        id: newTodo.id,
        data: {
          doneStatus: true,
        },
      });

      expect(status).toBe(200);
      expect(body.doneStatus).toBe(true);
    });

    test('Получить список завершенных задач', { tag: '@get' }, async ({ api }) => {
      const { status, body } = await api.todos.get({ token, params: { doneStatus: true } });

      expect(status).toBe(200);

      for (const todo of body.todos) {
        expect(todo.doneStatus).toBe(true);
      }
    });

    test('Удалить созданную задачу', { tag: '@delete' }, async ({ api }) => {
      const { status } = await api.todos.delete({ token, id: newTodo.id });

      expect(status).toBe(200);
    });

    test('Попытаться получить удаленную задачу', { tag: '@get' }, async ({ api }) => {
      const { status, statusText } = await api.todos.getById({ token, id: newTodo.id });

      expect(status).toBe(404);
      expect(statusText).toBe('Not Found');
    });
  });
});
