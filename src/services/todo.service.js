import { test } from '@playwright/test';
import { apiUrl } from '../helpers';

/**
 *  Несуществующий эндпоинт.
 */
export class TodoService {
  constructor(request) {
    this.request = request;
    this.path = 'todo';
  }

  async get(token) {
    return test.step(`GET /${this.path}`, async () => {
      const response = await this.request.get(`${apiUrl}/${this.path}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = response.status();
      const statusText = response.statusText();
      
      return { status, statusText };
    });
  }
}
