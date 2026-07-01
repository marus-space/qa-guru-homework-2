import { test } from '@playwright/test';
import { apiUrl } from '../helpers';

export class HeartbeatService {
  constructor(request) {
    this.request = request;
    this.path = 'heartbeat';
  }

  async get(token) {
    return test.step(`GET /${this.path}`, async () => {
      const response = await this.request.get(`${apiUrl}/${this.path}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = await response.status();
      const statusText = await response.statusText();
      const headers = await response.headers();
      
      return { status, statusText, headers };
    });
  }

  async patch(token) {
    return test.step(`PATCH /${this.path}`, async () => {
      const response = await this.request.patch(`${apiUrl}/${this.path}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = await response.status();
      const statusText = await response.statusText();
      const headers = await response.headers();
      
      return { status, statusText, headers };
    });
  }

  async delete(token) {
    return test.step(`DELETE /${this.path}`, async () => {
      const response = await this.request.delete(`${apiUrl}/${this.path}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = await response.status();
      const statusText = await response.statusText();
      const headers = await response.headers();
      
      return { status, statusText, headers };
    });
  }
}
