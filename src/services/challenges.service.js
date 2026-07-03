import { test } from '@playwright/test';
import { apiUrl } from '../helpers';

export class ChallengesService {
  constructor(request) {
    this.request = request;
    this.path = 'challenges';
  }

  async get(token) {
    return test.step(`GET /${this.path}`, async () => {
      const response = await this.request.get(`${apiUrl}/${this.path}`, {
        headers: {
          'x-challenger': token,
        },
      });

      const status = await response.status();
      const headers = await response.headers();
      const body = await response.json();
      
      return { status, headers, body };
    });
  }
}
